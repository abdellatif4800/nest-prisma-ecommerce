import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { log } from 'node:console';

@Controller('products')
export class ProductsAdminController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  create(
    @Body() createProductDto: CreateProductDto,
    @Body() createVariantDto: CreateVariantDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.productsService.create(
      createProductDto,
      createVariantDto,
      image,
    );
  }

  @Post('variants')
  @UseInterceptors(FileInterceptor('image'))
  createVariant(
    @UploadedFile() image: Express.Multer.File,
    @Body() createVariantDto: CreateVariantDto,
  ) {
    return this.productsService.createVariant(createVariantDto, image);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Patch('variants/:id')
  updateVariant(
    @Param('id') id: string,
    @Body() updateVariantDto: UpdateVariantDto,
  ) {
    return this.productsService.updateVariant(id, updateVariantDto);
  }
}
