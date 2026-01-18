import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaSetupService, Prisma } from 'apiLibs/prisma-setup';
import type { Product } from 'apiLibs/prisma-setup';
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

export type ProductWithVariants = Prisma.ProductGetPayload<{
  include: {
    variants: true;
    defaultVariant: true;
    subCategory: {
      select: {
        subCategory: true;
        category: {
          select: { category: true };
        };
      };
    };
  };
}>;

@Injectable()
export class ProductsService {
  constructor(
    private fileStorageService: FileStorageService,
    private prisma: PrismaSetupService,
  ) { }

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
        await this.fileStorageService.uploadFile(image, 'variants');

        const newVariant = await tx.productVariant.create({
          data: {
            ...createVariantDto,
            productId: newProd.id,
            imageFileName: `${image.originalname}`,
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

  private async formatProduct(product: ProductWithVariants) {
    // 1. Map directly - TS now knows 'v' is a Variant because we removed ': any'
    const sizes = [...new Set(product.variants.map((v) => v.size))];
    const colors = [...new Set(product.variants.map((v) => v.color))];
    const images = [
      ...new Set(
        product.variants
          .map((v) => v.imageFileName)
          .filter((url): url is string => !!url),
      ),
    ];

    const stockStats = await this.getStockTotals(product.id);

    // 2. Properly type the reduce accumulator to satisfy ESLint
    // This tells TS that the object will have string keys (colors) and a specific object shape
    const variantsGrouped = product.variants.reduce(
      (acc, variant) => {
        const { color, imageFileName } = variant;

        if (!acc[color]) {
          acc[color] = {
            sizes: [],
            total: 0,
            representativeImage: imageFileName || null,
          };
        }

        acc[color].sizes.push({
          id: variant.id,
          size: variant.size,
          stock: variant.stock,
          publish: variant.publish,
          price: variant.price,
        });

        acc[color].total += variant.stock;
        if (!acc[color].representativeImage && imageFileName) {
          acc[color].representativeImage = imageFileName;
        }
        return acc;
      },
      {} as Record<
        string,
        { sizes: any[]; total: number; representativeImage: string | null }
      >,
    );

    // 3. Object.entries will now be correctly typed
    const variantsByColor = Object.entries(variantsGrouped).map(
      ([color, data]) => ({
        color,
        total: data.total,
        image: data.representativeImage,
        sizes: data.sizes,
      }),
    );

    return {
      ...product,
      variantsByColor,
      sizes,
      colors,
      images,
      stockStats,
    };
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
    return {
      product: await this.formatProduct(product),
    };
    // const sizes = [...new Set(product.variants.map((v) => v.size))];
    // const colors = [...new Set(product.variants.map((v) => v.color))];
    // const images = [
    //   ...new Set(product.variants.map((v) => v.imageUrl).filter(Boolean)),
    // ];
    //
    // const stockStats = await this.getStockTotals(product.id);
    //
    // // ---------------------------------------------------------
    // const variantsGrouped = product.variants.reduce(
    //   (acc, variant) => {
    //     // 1. Initialize the color object if it doesn't exist
    //     if (!acc[variant.color]) {
    //       acc[variant.color] = {
    //         sizes: [],
    //         total: 0, // <--- Initialize total stock
    //       };
    //     }
    //
    //     // 2. Add the variant details
    //     acc[variant.color].sizes.push({
    //       id: variant.id,
    //       size: variant.size,
    //       stock: variant.stock,
    //       publish: variant.publish,
    //       price: variant.price,
    //     });
    //
    //     // 3. Accumulate the stock
    //     acc[variant.color].total += variant.stock;
    //
    //     return acc;
    //   },
    //   // Updated Type Definition
    //   {} as Record<
    //     string,
    //     {
    //       sizes: {
    //         id: string;
    //         size: string;
    //         stock: number;
    //         publish: boolean;
    //         price: number | null;
    //       }[];
    //       total: number;
    //     }
    //   >,
    // );
    //
    // // 4. Format for return
    // const variantsByColor = Object.entries(variantsGrouped).map(
    //   ([color, data]) => ({
    //     color: color,
    //     total: data.total, // <--- Include the total in the final object
    //     sizes: data.sizes,
    //   }),
    // );
    // // ---------------------------------------------------------

    // return {
    //   product: {
    //     ...product,
    //     variantsByColor,
    //     sizes,
    //     colors,
    //     images,
    //     stockStats,
    //   },
    // };
  }

  async findProducts(filters: productsFiltersParams) {
    const where: ProductWhereInput = {};

    if (filters.minRate != undefined || filters.maxRate != undefined) {
      where.rate = {};
      if (filters.minRate) where.rate.gte = Number(filters.minRate);
      if (filters.maxRate) where.rate.lte = Number(filters.maxRate);
    }

    if (
      filters.minDiscount !== undefined ||
      filters.maxDiscount !== undefined
    ) {
      where.discount = {};

      if (filters.minDiscount !== undefined) {
        where.discount.gte = Number(filters.minDiscount);
      }

      if (filters.maxDiscount !== undefined) {
        where.discount.lte = Number(filters.maxDiscount);
      }
    }

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
      where.subCategoryId = filters.subCategory;
    }

    if (filters.publish != undefined) {
      where.publish = filters.publish;
    }

    // ---------------- PAGINATION ----------------
    // const page = Number(filters.page ?? 1);
    const limit = Number(filters.limit ?? 5);
    // const skip = (page - 1) * limit;

    const result = await this.prisma.product.findMany({
      take: limit + 1,
      skip: filters.cursor ? 1 : 0,
      cursor: filters.cursor ? { id: filters.cursor } : undefined,
      orderBy: { id: 'desc' },
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

    if (result.length > limit) {
      result.pop();
      // const nextItem = result.pop();
      // nextCursor = nextItem!.id;
    }

    const lastItem = result[result.length - 1];
    const nextCursor = lastItem ? lastItem.id : null;
    const count = await this.prisma.product.count({ where });
    const totalPages = Math.ceil(count / limit);

    const productsWithOptions = await Promise.all(
      result.map((product) => this.formatProduct(product)),
    );
    // console.log('Current Cursor Input:', filters.cursor);
    // console.log(
    //   'Fetched IDs:',
    //   result.map((p) => p.id),
    // );
    // console.log('Extracted nextCursor:', nextCursor);
    return {
      result: productsWithOptions,
      nextCursor,
      count: count,
      totalPages: totalPages,
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
        imageFileName: variantImage,
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
