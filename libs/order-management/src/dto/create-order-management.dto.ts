import { IsString, IsNotEmpty } from 'class-validator';

export class CreateOrderManagementDto {
  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  paymentMethod: string;
}
