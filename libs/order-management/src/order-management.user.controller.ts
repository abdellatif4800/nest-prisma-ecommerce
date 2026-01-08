import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { OrderManagementService } from './order-management.service';
import { CreateOrderManagementDto } from './dto/create-order-management.dto';
import { UpdateOrderManagementDto } from './dto/update-order-management.dto';
import { AuthGuard, CurrentUser } from 'apiLibs/common';
import type { UserAuthPayload } from 'apiLibs/common';

@UseGuards(AuthGuard)
@Controller('order-management')
export class OrderManagementUserController {
  constructor(
    private readonly orderManagementService: OrderManagementService,
  ) {}

  @Post()
  create(
    @CurrentUser() user: UserAuthPayload,
    @Body() createOrderManagementDto: CreateOrderManagementDto,
  ) {
    return this.orderManagementService.create(
      user.sub,
      createOrderManagementDto,
    );
  }

  @Get()
  findOrders(
    @CurrentUser() user: UserAuthPayload,
    @Query('id') id?: string,
    @Query('status') status?: string,
    @Query('paymentMethod') paymentMethod?: string,
    @Query('createdAt') createdAt?: string,
  ) {
    return this.orderManagementService.findUserOrders(user.sub, {
      id,
      status,
      paymentMethod,
      createdAt,
    });
  }

  @Patch('cancel/:orderId')
  cancelOrder(
    @CurrentUser() user: UserAuthPayload,
    @Param('orderId') orderId: string,
  ) {
    return this.orderManagementService.cancelOrder(user.sub, orderId);
  }

  @Patch('refundRequest/:orderId')
  refundRequest(
    @CurrentUser() user: UserAuthPayload,
    @Param('orderId') orderId: string,
  ) {
    return this.orderManagementService.refundRequest(user.sub, orderId);
  }
}
