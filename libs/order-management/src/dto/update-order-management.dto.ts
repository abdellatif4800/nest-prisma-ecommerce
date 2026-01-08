import { PartialType } from '@nestjs/mapped-types';
import { CreateOrderManagementDto } from './create-order-management.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateOrderManagementDto extends PartialType(
  CreateOrderManagementDto,
) {
  @IsOptional()
  @IsString()
  // @IsEnum(OrderStatus) // Recommended: Use this to prevent "prepairing" typos
  status?: string;
}
