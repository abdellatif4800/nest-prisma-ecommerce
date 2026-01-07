import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CartManagementService } from './cart-management.service';

@Controller('cart-management')
export class CartManagementAdminController {
  constructor(private readonly cartManagementService: CartManagementService) {}

  // @Post()
  // create(@Body() createCartManagementDto: CreateCartManagementDto) {
  //   return this.cartManagementService.create(createCartManagementDto);
  // }
  //
  // @Get()
  // findAll() {
  //   return this.cartManagementService.findAll();
  // }
  //
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.cartManagementService.findOne(+id);
  // }
  //
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
