import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsUUID,
  Min,
  MinLength,
  IsBoolean,
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
  @Type(() => Number)
  stock!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  price?: number;

  @IsString()
  //@IsUUID() //for prod
  @IsOptional()
  productId!: string;

  @IsString()
  @IsOptional()
  imageFileName?: string;

  @IsBoolean()
  @IsOptional()
  publish?: boolean;
}
