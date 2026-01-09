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

@Injectable()
export class CartManagementService {
  constructor(private prisma: PrismaSetupService) {}

  async addItemToCart(createCartItem: CreateCartItemDto) {
    const { userID, variantID } = createCartItem;

    const targetCart = await this.findCart(userID);

    if (!targetCart) throw new NotFoundException();

    const newItem = await this.prisma.cartItem.upsert({
      where: {
        cartId_variantId: {
          cartId: targetCart.id,
          variantId: variantID,
        },
      },
      update: {
        quantity: {
          increment: 1,
        },
      },
      create: {
        cartId: targetCart.id,
        variantId: variantID,
        quantity: 1,
      },
      include: {
        cart: {
          select: {
            id: true,
            items: true,
          },
        },
      },
    });
    return newItem;
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
              },
            },
          },
        },
      },
    });

    if (!targetCart) throw new ConflictException();

    return targetCart;
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
}
