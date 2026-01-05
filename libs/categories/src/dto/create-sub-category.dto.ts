import { IsString, MinLength, IsUUID } from 'class-validator';

export class CreateSubCategoryDto {
  @IsString()
  @MinLength(1)
  subCategory!: string;

  @IsUUID()
  categoryId!: string;
}
