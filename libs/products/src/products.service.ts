import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaSetupService } from 'apiLibs/prisma-setup';
import {
  ProductVariantWhereInput,
  ProductWhereInput,
} from 'apiLibs/prisma-setup/generatedClient/models';
import {
  productsFiltersParams,
  productsVariantsFiltersParams,
} from 'apiLibs/common';
import { CreateVariantDto } from './dto/create-variant.dto';
import { UpdateVariantDto } from './dto/update-variant.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaSetupService) { }

  async create(createProductDto: CreateProductDto) {
    const result = await this.prisma.product.create({
      data: {
        ...createProductDto,
        publish: false,
      },
      include: {
        variants: true,
      },
    });
    return result;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    // await this.findProducts({ id: id });
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async findProducts(filters: productsFiltersParams) {
    const where: ProductWhereInput = {};

    if (filters.minPrice != undefined || filters.maxPrice != undefined) {
      where.price = {};
      if (filters.minPrice) where.price.gte = Number(filters.minPrice);
      if (filters.maxPrice) where.price.lte = Number(filters.maxPrice);
    }

    if (filters.search != undefined) {
      where.productName = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    if (filters.subCategory != undefined) {
      where.subCategory = {
        subCategory: filters.subCategory,
      };
    }

    if (filters.publish != undefined) {
      where.publish = filters.publish;
    }

    if (filters.id != undefined) {
      where.id = filters.id;
    }

    const result = await this.prisma.product.findMany({
      where: where,

      include: {
        variants: true,
        subCategory: {
          select: {
            subCategory: true,
            category: {
              select: {
                category: true,
              },
            },
          },
        },
      },
    });
    return result;
  }

  //----------------------------------------------------------
  async createVariant(createVariantDto: CreateVariantDto) {
    const result = await this.prisma.productVariant.create({
      data: {
        ...createVariantDto,
      },
    });
    return result;
  }

  async updateVariant(id: string, updateVariantDto: UpdateVariantDto) {
    return this.prisma.productVariant.update({
      where: { id },
      data: updateVariantDto,
    });
  }

  async findVariants(filters: productsVariantsFiltersParams) {
    const where: ProductVariantWhereInput = {};

    if (filters.minPrice != undefined || filters.maxPrice != undefined) {
      where.price = {};
      if (filters.minPrice) where.price.gte = filters.minPrice;
      if (filters.maxPrice) where.price.lte = filters.maxPrice;
    }

    if (filters.productId != undefined) {
      where.productId = filters.productId;
    }

    if (filters.minStock != undefined || filters.maxStock != undefined) {
      where.stock = {};
      if (filters.minStock) where.stock.gte = filters.minStock;
      if (filters.maxStock) where.stock.lte = filters.maxStock;
    }

    if (filters.color != undefined) {
      where.color = filters.color;
    }

    if (filters.size != undefined) {
      where.size = filters.size;
    }

    if (filters.id != undefined) {
      where.id = filters.id;
    }

    const result = await this.prisma.productVariant.findMany({
      where: where,
      include: {
        product: true,
      },
    });
    return result;
  }
}
