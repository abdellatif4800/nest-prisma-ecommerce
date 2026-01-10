import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  IsUUID,
  Min,
  MinLength,
  IsUrl,
} from 'class-validator';

export class CreateProductDto {
  @IsString()
  @MinLength(1)
  productName!: string;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  price!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  @Type(() => Number)
  discount?: number;

  @IsString()
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  publish?: boolean;

  // @IsUUID() //for prod
  @IsString()
  subCategoryId!: string;
}
