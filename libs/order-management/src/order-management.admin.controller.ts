import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { OrderManagementService } from './order-management.service';
import { CreateOrderManagementDto } from './dto/create-order-management.dto';
import { UpdateOrderManagementDto } from './dto/update-order-management.dto';

@Controller('order-management')
export class OrderManagementAdminController {
  constructor(
    private readonly orderManagementService: OrderManagementService,
  ) {}

  @Get()
  findOrders(
    @Query('userId') userId: string,
    @Query('id') id?: string,
    @Query('status') status?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('createdAt') createdAt?: string,
  ) {
    return this.orderManagementService.findAllOrders({
      id,
      userId,
      status,
      paymentMethod,
      createdAt,
    });
  }

  @Patch(':orderId')
  updateOrder(
    @Param('orderId') orderId: string,
    @Body() updateOrderDto: UpdateOrderManagementDto,
  ) {
    return this.orderManagementService.updateOrder(orderId, updateOrderDto);
  }

  @Post('finishRefund/:orderId')
  finishRefund(@Param('orderId') orderId: string) {
    return this.orderManagementService.finishRefund(orderId);
  }
}
