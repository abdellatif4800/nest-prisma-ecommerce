import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
  Post,
  Patch,
  BadRequestException,
} from '@nestjs/common';
import { CartManagementService } from './cart-management.service';
import { AuthGuard, CurrentUser } from 'apiLibs/common';
import type { UserAuthPayload } from 'apiLibs/common';

@Controller('cart-management')
@UseGuards(AuthGuard)
export class CartManagementUsersController {
  constructor(private readonly cartManagementService: CartManagementService) {}

  @Get('')
  findOne(@CurrentUser() user: UserAuthPayload) {
    return this.cartManagementService.findCart(user.sub);
  }

  @Post('addItem/:variantID')
  addItem(
    @CurrentUser() user: UserAuthPayload,
    @Param('variantID') variantID: string,
  ) {
    return this.cartManagementService.addItemToCart({
      userID: user.sub,
      variantID,
    });
  }

  @Patch('increaseQuantity/:itemId')
  increaseQuantity(@Param('itemId') itemId: string) {
    return this.cartManagementService.increaseQuantity(itemId);
  }

  @Patch('decreaseQuantity/:itemId')
  decreaseQuantity(@Param('itemId') itemId: string) {
    return this.cartManagementService.decreaseQuantity(itemId);
  }

  @Delete('deleteItem/:itemId')
  removeItem(@Param('itemId') itemId: string) {
    return this.cartManagementService.removeItem(itemId);
  }

  @Delete('clearCart')
  clearCart(@CurrentUser() user: UserAuthPayload) {
    if (!user?.cartID) {
      throw new BadRequestException('Cart ID is required');
    }
    return this.cartManagementService.clearCart(user?.cartID);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateCartManagementDto: UpdateCartManagementDto,
  // ) {
  //   return this.cartManagementService.update(+id, updateCartManagementDto);
  // }
  //
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.cartManagementService.remove(+id);
  // }
}
