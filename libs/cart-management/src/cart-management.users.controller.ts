import {
  Controller,
  Delete,
  Get,
  Param,
  Query,
  UseGuards,
  Post,
  Patch,
} from '@nestjs/common';
import { CartManagementService } from './cart-management.service';
import { AuthGuard } from 'apiLibs/common';

@Controller('cart-management')
@UseGuards(AuthGuard)
export class CartManagementUsersController {
  constructor(private readonly cartManagementService: CartManagementService) {}

  @Get(':userID')
  findOne(@Param('userID') userID: string) {
    return this.cartManagementService.findCart(userID);
  }

  @Post('addItem/:userID')
  addItem(
    @Param('userID') userID: string,
    @Query('variantID') variantID: string,
  ) {
    return this.cartManagementService.addItemToCart({ userID, variantID });
  }

  @Patch('increaseQuantity/:itemId')
  increaseQuantity(@Param('itemId') itemId: string) {
    return this.cartManagementService.increaseQuantity(itemId);
  }

  @Patch('decreaseQuantity/:itemId')
  decreaseQuantity(@Param('itemId') itemId: string) {
    return this.cartManagementService.decreaseQuantity(itemId);
  }

  @Delete(':itemId')
  removeItem(@Param('itemId') itemId: string) {
    return this.cartManagementService.removeItem(itemId);
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
