import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { CreateOrderManagementDto } from './dto/create-order-management.dto';
import { UpdateOrderManagementDto } from './dto/update-order-management.dto';
import {
  PrismaSetupModule,
  PrismaSetupService,
  User,
} from 'apiLibs/prisma-setup';
import { AuthGuard } from 'apiLibs/common';
import { CartManagementService } from 'apiLibs/cart-management';
import { log } from 'console';
import { ProductsService } from 'apiLibs/products';
import { OrderWhereInput } from 'apiLibs/prisma-setup/generatedClient/models';
import { OrdersFiltersParams } from 'apiLibs/common';

@Injectable()
export class OrderManagementService {
  constructor(
    private prisma: PrismaSetupService,
    private cartservice: CartManagementService,
  ) {}

  async create(
    userId: string,
    createOrderManagementDto: CreateOrderManagementDto,
  ) {
    const { address, paymentMethod } = createOrderManagementDto;

    const targetCart = await this.cartservice.findCart(userId);

    const totalPrice = targetCart.items.reduce((acc, item) => {
      return acc + item.quantity * (item.variant.price ?? 0);
    }, 0);

    const newOrderTransaction = this.prisma.$transaction(async (tx) => {
      const newOrder = await tx.order.create({
        data: {
          userId: userId,
          total: totalPrice,
          status: 'pending',
          address: address,
          paymentMethod: paymentMethod,

          items: {
            create: targetCart.items.map((cartItem) => ({
              variant: {
                connect: { id: cartItem.variant.id },
              },
              quantity: cartItem.quantity,
              snapshotPrice: cartItem.variant.price ?? 0,
            })),
          },
        },

        include: {
          items: true,
        },
      });

      //---- update stock ------
      for (const item of targetCart.items) {
        await tx.productVariant.update({
          where: {
            id: item.variant.id,
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      //---- clear cart -----
      await tx.cartItem.deleteMany({
        where: {
          cartId: targetCart.id,
        },
      });

      return newOrder;
    });
    return newOrderTransaction;
  }

  async findUserOrders(userId: string, filters: OrdersFiltersParams) {
    const where: OrderWhereInput = {
      userId: userId,
    };

    if (filters.id !== undefined) {
      where.id = filters.id;
    }

    if (filters.status !== undefined) {
      where.status = filters.status;
    }

    if (filters.paymentMethod !== undefined) {
      where.paymentMethod = filters.paymentMethod;
    }

    if (filters.createdAt !== undefined) {
      where.createdAt = filters.createdAt;
    }

    if (filters.minTotal != undefined || filters.maxTotal != undefined) {
      where.total = {};
      if (filters.minTotal) where.total.gte = filters.minTotal;
      if (filters.maxTotal) where.total.lte = filters.maxTotal;
    }

    const orders = await this.prisma.order.findMany({
      where: where,
      include: {
        items: true,
      },
    });

    return orders;
  }

  async cancelOrder(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    if (order.userId !== userId) {
      throw new ForbiddenException('You are not allowed to cancel this order');
    }

    if (['shipped', 'delivered', 'cancelled'].includes(order.status)) {
      throw new BadRequestException(
        `Cannot cancel order with status: ${order.status}`,
      );
    }

    const canceleOrderTransaction = await this.prisma.$transaction(
      async (tx) => {
        const cancelledOrder = await tx.order.update({
          where: { id: orderId },
          data: { status: 'cancelled' },
        });

        for (const item of order.items) {
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });
        }

        return cancelledOrder;
      },
    );
    return canceleOrderTransaction;
  }

  async refundRequest(userId: string, orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (order.userId !== userId) {
      throw new ForbiddenException('You are not allowed to cancel this order');
    }

    if (order.status !== 'delivered') {
      throw new BadRequestException(
        `Cannot refund order with status: ${order.status}. Order must be delivered or requested for return first.`,
      );
    }

    const refundedOrder = await this.prisma.order.update({
      where: { id: order.id },
      data: {
        status: 'refund_requested',
      },
    });

    return refundedOrder;
  }

  //----------------ADMIN-------------------
  async findAllOrders(filters: OrdersFiltersParams) {
    const where: OrderWhereInput = {};

    if (filters.id !== undefined) {
      where.id = filters.id;
    }

    if (filters.userId !== undefined) {
      where.userId = filters.userId;
    }

    if (filters.status !== undefined) {
      where.status = filters.status;
    }

    if (filters.paymentMethod !== undefined) {
      where.paymentMethod = filters.paymentMethod;
    }

    if (filters.createdAt !== undefined) {
      where.createdAt = filters.createdAt;
    }

    if (filters.minTotal != undefined || filters.maxTotal != undefined) {
      where.total = {};
      if (filters.minTotal) where.total.gte = filters.minTotal;
      if (filters.maxTotal) where.total.lte = filters.maxTotal;
    }

    const orders = await this.prisma.order.findMany({
      where: where,
      include: { items: true },
    });

    return orders;
  }

  async updateOrder(orderId: string, updateOrderDto: UpdateOrderManagementDto) {
    const updatedOrder = await this.prisma.order.update({
      where: {
        id: orderId,
      },
      data: updateOrderDto,
    });
    return updatedOrder;
  }

  async finishRefund(orderId: string) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new NotFoundException('Order not found');

    if (order.status !== 'return_approved') {
      throw new BadRequestException('Order must be approved for return first');
    }

    return await this.prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return await tx.order.update({
        where: { id: orderId },
        data: { status: 'refunded' },
      });
    });
  }
}
