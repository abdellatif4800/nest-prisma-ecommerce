import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaSetupService } from 'apiLibs/prisma-setup';
import { CreateCartItemDto } from './dto/create-cart-item.dto';
import { log } from 'node:console';

@Injectable()
export class CartManagementService {
  constructor(private prisma: PrismaSetupService) {}
  private calculateFinalPrice(
    productPrice: number,
    variantPrice: number | null,
    discount?: number | null,
  ): number {
    const basePrice = variantPrice ?? productPrice;

    if (discount && discount > 0) {
      return basePrice - basePrice * (discount / 100);
    }

    return basePrice;
  }
  async addItemToCart(createCartItem: CreateCartItemDto) {
    const { userID, variantID } = createCartItem;

    const targetCart = await this.findCart(userID);

    if (!targetCart) throw new NotFoundException();

    const newItemTransction = await this.prisma.$transaction(async (tx) => {
      const variant = await tx.productVariant.findUnique({
        where: { id: variantID },
        select: { stock: true },
      });

      if (!variant) throw new NotFoundException('Product variant not found');
      if (variant.stock < 1) {
        throw new BadRequestException('Item is out of stock');
      }

      const existingCartItem = await tx.cartItem.findFirst({
        where: {
          cartId: targetCart.id,
          variantId: variantID,
        },
      });
      if (existingCartItem)
        throw new ConflictException('Product aleardy exist in cart.');

      return await tx.cartItem.create({
        data: {
          cartId: targetCart.id,
          variantId: variantID,
          quantity: 1,
        },
        include: {
          cart: {
            select: {
              id: true,
              items: {
                select: {
                  variant: {
                    select: {
                      id: true,
                      color: true,
                      size: true,
                      stock: true,
                      price: true,
                      imageFileName: true,
                      product: true,
                    },
                  },
                },
              },
            },
          },
        },
      });
    });
    return newItemTransction;
  }

  async findCart(userID: string) {
    const targetCart = await this.prisma.cart.findUnique({
      where: {
        userId: userID,
      },

      include: {
        items: {
          select: {
            id: true,
            quantity: true,
            variant: {
              select: {
                id: true,
                color: true,
                size: true,
                price: true,
                stock: true,
                product: true,
                imageFileName: true,
              },
            },
          },
        },
      },
    });

    if (!targetCart) throw new ConflictException();

    const itemsWithSubtotal = targetCart.items.map((item) => {
      const { product, price: variantPrice } = item.variant;

      const finalPrice = this.calculateFinalPrice(
        product.price,
        variantPrice,
        product.discount,
      );

      return {
        ...item,
        unitPrice: finalPrice, // 👈 useful for UI
        subtotal: finalPrice * item.quantity,
      };
    });

    const total = itemsWithSubtotal.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );

    return {
      ...targetCart,
      items: itemsWithSubtotal,
      total,
    };
  }

  //------------------------------------------

  async increaseQuantity(itemId: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
      include: {
        variant: true,
      },
    });

    if (!item) throw new NotFoundException('Cart item not found');

    if (item.quantity + 1 > item.variant.stock) {
      throw new BadRequestException('Insufficient stock');
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: { increment: 1 } },
      include: {
        variant: true,
        // cart: {
        //   select: {
        //     id: true,
        //     items: true,
        //   },
        // },
      },
    });
  }

  //------------------------------------------
  async decreaseQuantity(itemId: string) {
    const item = await this.prisma.cartItem.findUnique({
      where: { id: itemId },
    });

    if (!item) throw new NotFoundException();

    if (item.quantity <= 1) {
      throw new BadRequestException('Cannot decrease quantity below 1');
    }

    return this.prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: { decrement: 1 } },
      include: {
        variant: true,
        // cart: {
        //   select: {
        //     id: true,
        //     items: true,
        //   },
        // },
      },
    });
  }

  //------------------------------------------

  async removeItem(itemId: string) {
    return this.prisma.cartItem.delete({
      where: { id: itemId },
      include: { cart: { select: { id: true, items: true } } },
    });
  }

  async clearCart(cartId: string) {
    return this.prisma.cartItem.deleteMany({
      where: {
        cartId,
      },
    });
  }
}
