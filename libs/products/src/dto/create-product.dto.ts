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
  price!: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number;

  @IsString()
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  publish?: boolean;

  @IsUUID()
  subCategoryId!: string;
}
