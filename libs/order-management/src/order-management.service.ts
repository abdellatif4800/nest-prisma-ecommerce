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
import { PaymentManagementService } from 'apiLibs/payment-management';
import type { UserAuthPayload } from 'apiLibs/common';

@Injectable()
export class OrderManagementService {
  constructor(
    private prisma: PrismaSetupService,
    private cartservice: CartManagementService,
    private paymentService: PaymentManagementService,
  ) { }

  async restockAndClearCart(userId: string, orderId: string) {
    const targetCart = await this.cartservice.findCart(userId);

    return this.prisma.$transaction(async (tx) => {
      //update Order Payment status
      await tx.order.update({
        where: {
          id: orderId,
        },
        data: {
          paymentStatus: 'paid',
          status: 'processing',
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
    });
  }

  async create(
    user: UserAuthPayload,
    createOrderManagementDto: CreateOrderManagementDto,
  ) {
    const { address, paymentMethod } = createOrderManagementDto;

    const targetCart = await this.cartservice.findCart(user.sub);

    const totalPrice = targetCart.items.reduce((acc, item) => {
      return acc + item.quantity * (item.variant.price ?? 0);
    }, 0);

    if (targetCart.items.length === 0)
      throw new NotFoundException('no items in cart ');

    if (paymentMethod === 'COD') {
      //Cash on delivery
      const newOrderForCOD = this.prisma.$transaction(async (tx) => {
        try {
          for (const item of targetCart.items) {
            const variant = await tx.productVariant.findUnique({
              where: { id: item.variant.id },
              select: { stock: true, id: true },
            });

            if (!variant || variant.stock < item.quantity) {
              throw new BadRequestException(
                `Insufficient stock for item: ${item.variant.id}`,
              );
            }
          }
          const newOrder = await tx.order.create({
            data: {
              userId: user.sub,
              total: totalPrice,
              status: 'processing',
              address: address,
              paymentMethod: paymentMethod,
              arriveAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
              paymentStatus: 'COD',

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
        } catch (err: any) {
          log(err);
          throw err;
        }
      });

      return newOrderForCOD;
    }

    if (paymentMethod === 'by card') {
      const newOrderForPaymentIntent = this.prisma.$transaction(async (tx) => {
        for (const item of targetCart.items) {
          const variant = await tx.productVariant.findUnique({
            where: { id: item.variant.id },
            select: { stock: true, id: true },
          });

          if (!variant || variant.stock < item.quantity) {
            // Use BadRequest or UnprocessableEntity for logic errors
            throw new BadRequestException(
              `Insufficient stock for item: ${item.variant.id}`,
            );
          }
        }
        const newOrder = await tx.order.create({
          data: {
            userId: user.sub,
            total: totalPrice,
            status: 'pending',
            address: address,
            paymentMethod: paymentMethod,
            arriveAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days
            paymentStatus: 'wait_for_payment',

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

        if (!user.cartID) {
          throw new Error('User has no cart ID');
        }

        const newPaymentIntent = await this.paymentService.createPaymentIntent(
          totalPrice,
          'usd',
          user.sub,
          user.cartID,
          newOrder.id,
        );

        return {
          order: await tx.order.update({
            where: { id: newOrder.id },
            data: {
              paymentIntentId: newPaymentIntent.id,
            },
          }),
          paymentIntentClientSecret: newPaymentIntent.client_secret,
        };
      });

      return newOrderForPaymentIntent;
    }
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
        items: {
          select: {
            quantity: true,
            variant: {
              select: {
                color: true,
                size: true,
                price: true,
                imageFileName: true,
                publish: true,
                id: true,
                product: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc', // or 'asc' for oldest first
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
          data: { status: 'cancelld' },
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
