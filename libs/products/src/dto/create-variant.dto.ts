import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export class CreateVariantDto {
  @IsString()
  @MinLength(1)
  color!: string;

  @IsString()
  @MinLength(1)
  size!: string;

  @IsNumber()
  @Min(0)
  stock!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  price?: number;

  @IsUUID()
  productId!: string;
}
