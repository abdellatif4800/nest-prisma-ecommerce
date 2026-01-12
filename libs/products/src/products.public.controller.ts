import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsPublicController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  findAll(
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('subCategory') subCategory?: string,
    @Query('search') search?: string,
    @Query('publish') publish?: boolean,
    @Query('id') id?: string,
  ) {
    return this.productsService.findProducts({
      minPrice,
      maxPrice,
      subCategory,
      search,
      publish,
      id,
    });
  }

  @Get('variants')
  findVariants(
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
    @Query('minStock') minStock?: number,
    @Query('maxStock') maxStock?: number,
    @Query('color') color?: string,
    @Query('productId') productId?: string,
    @Query('id') id?: string,
    @Query('size') size?: string,
  ) {
    return this.productsService.findVariants({
      minPrice,
      maxPrice,
      minStock,
      maxStock,
      color,
      productId,
      id,
      size,
    });
  }

  @Get(':prodId')
  findOne(@Param('prodId') prodId: string) {
    return this.productsService.findSingleProduct(prodId);
  }

  @Get('getStockTotals/:productId')
  getStockTotals(@Param('productId') productId: string) {
    return this.productsService.getStockTotals(productId);
  }
}
