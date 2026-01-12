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
import { FileStorageService } from 'apiLibs/file-storage';
import { log } from 'console';

@Injectable()
export class ProductsService {
  constructor(
    private fileStorageService: FileStorageService,
    private prisma: PrismaSetupService,
  ) {}

  async create(
    createProductDto: CreateProductDto,
    createVariantDto: CreateVariantDto,
    image: Express.Multer.File,
  ) {
    const createProductTransaction = await this.prisma.$transaction(
      async (tx) => {
        const newProd = await tx.product.create({
          data: {
            ...createProductDto,
            publish: false,
          },
          include: {
            variants: true,
          },
        });
        const variantImage = await this.fileStorageService.uploadFile(
          image,
          'variants',
        );
        log(newProd.id);
        const newVariant = await tx.productVariant.create({
          data: {
            ...createVariantDto,
            productId: newProd.id,
            imageUrl: variantImage,
          },
        });

        return await tx.product.update({
          where: { id: newProd.id },
          data: {
            defaultVariantId: newVariant.id,
          },
          include: {
            variants: true,
          },
        });
      },
    );

    return createProductTransaction;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    // await this.findProducts({ id: id });
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto,
    });
  }

  async findSingleProduct(prodId: string) {
    const product = await this.prisma.product.findUnique({
      where: { id: prodId },

      include: {
        variants: true,
        defaultVariant: true,
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

    if (!product) {
      return null; // or throw NotFoundException in NestJS
    }

    const sizes = [...new Set(product.variants.map((v) => v.size))];
    const colors = [...new Set(product.variants.map((v) => v.color))];
    const images = [
      ...new Set(product.variants.map((v) => v.imageUrl).filter(Boolean)),
    ];

    const stockStats = await this.getStockTotals(product.id);

    return {
      product: {
        ...product,
        sizes,
        colors,
        images,
        stockStats,
      },
    };
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

    const result = await this.prisma.product.findMany({
      where: where,

      include: {
        variants: true,
        defaultVariant: true,
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

    const productsWithOptions = await Promise.all(
      result.map(async (product) => {
        const sizes = [...new Set(product.variants.map((v) => v.size))];
        const colors = [...new Set(product.variants.map((v) => v.color))];
        const images = [
          ...new Set(product.variants.map((v) => v.imageUrl).filter(Boolean)),
        ];

        const stockStats = await this.getStockTotals(product.id);

        return {
          ...product,
          sizes,
          colors,
          images,
          stockStats,
        };
      }),
    );

    return {
      products: productsWithOptions,
    };
  }

  //----------------------------------------------------------
  async createVariant(
    createVariantDto: CreateVariantDto,
    image: Express.Multer.File,
  ) {
    const variantImage = await this.fileStorageService.uploadFile(
      image,
      'variants',
    );

    const result = await this.prisma.productVariant.create({
      data: {
        ...createVariantDto,
        imageUrl: variantImage,
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

  //-----------------------------------------------------------
  async getStockTotals(productId: string) {
    const [byColor, bySize, totalSum] = await Promise.all([
      this.prisma.productVariant.groupBy({
        by: ['color'],
        where: { productId },
        _sum: { stock: true },
      }),
      this.prisma.productVariant.groupBy({
        by: ['size'],
        where: { productId },
        _sum: { stock: true },
      }),
      this.prisma.productVariant.aggregate({
        where: { productId },
        _sum: { stock: true },
      }),
    ]);

    return {
      productId,
      totalGlobalStock: totalSum._sum.stock ?? 0,
      stockByColor: byColor.map((item) => ({
        color: item.color,
        total: item._sum.stock ?? 0,
      })),
      stockBySize: bySize.map((item) => ({
        size: item.size,
        total: item._sum.stock ?? 0,
      })),
    };
  }
}
