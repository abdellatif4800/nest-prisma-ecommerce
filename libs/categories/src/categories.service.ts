import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateSubCategoryDto } from './dto/create-sub-category.dto';
import { UpdateSubCategoryDto } from './dto/update-sub-category.dto';
import { PrismaSetupService } from 'apiLibs/prisma-setup';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaSetupService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    return this.prisma.category.create({
      data: createCategoryDto,
      include: {
        subCategories: true,
      },
    });
  }

  async findAll() {
    return this.prisma.category.findMany({
      include: {
        subCategories: true,
      },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        subCategories: true,
      },
    });
    if (!category)
      throw new NotFoundException(`Category with ID ${id} not found`);
    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    await this.findOne(id);
    return this.prisma.category.update({
      where: { id },
      data: updateCategoryDto,
      include: {
        subCategories: true,
      },
    });
  }

  async createSubCategory(createSubCategoryDto: CreateSubCategoryDto) {
    return this.prisma.subCategory.create({
      data: createSubCategoryDto,
      include: {
        category: {
          select: {
            category: true,
          },
        },

        products: true,
      },
    });
  }

  async findAllSubCategories() {
    return this.prisma.subCategory.findMany({
      include: {
        category: {
          select: {
            category: true, // ✅ category name
          },
        },
        products: true,
        _count: {
          select: {
            products: true, // ✅ count products
          },
        },
      },
    });
  }

  async findOneSubCategory(id: string) {
    const subCategory = await this.prisma.subCategory.findUnique({
      where: { id },
      include: {
        products: true,
        category: {
          select: {
            category: true, // ✅ category name
          },
        },
        _count: {
          select: {
            products: true, // ✅ count products
          },
        },
      },
    });
    if (!subCategory)
      throw new NotFoundException(`SubCategory with ID ${id} not found`);
    return subCategory;
  }

  async updateSubCategory(
    id: string,
    updateSubCategoryDto: UpdateSubCategoryDto,
  ) {
    await this.findOneSubCategory(id);
    return this.prisma.subCategory.update({
      where: { id },
      data: updateSubCategoryDto,
      include: {
        category: {
          select: {
            category: true, // ✅ category name
          },
        },

        products: true,
      },
    });
  }

  async findSubCategoriesByCategory(categoryId: string) {
    return this.prisma.subCategory.findMany({
      where: { categoryId },
      include: {
        products: true,
        category: {
          select: {
            category: true, // ✅ category name
          },
        },
      },
    });
  }
}
