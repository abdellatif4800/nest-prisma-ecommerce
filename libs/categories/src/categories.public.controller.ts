import { Controller, Get, Param } from '@nestjs/common';
import { CategoriesService } from './categories.service';

@Controller('categories')
export class CategoriesPublicController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get('subcategories')
  findAllSubCategories() {
    return this.categoriesService.findAllSubCategories();
  }

  @Get('subcategories/:id')
  findOneSubCategory(@Param('id') id: string) {
    return this.categoriesService.findOneSubCategory(id);
  }

  @Get(':categoryId/subcategories')
  findSubCategoriesByCategory(@Param('categoryId') categoryId: string) {
    return this.categoriesService.findSubCategoriesByCategory(categoryId);
  }

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(id);
  }
}
