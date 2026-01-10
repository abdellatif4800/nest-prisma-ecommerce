import { CategoriesService } from 'apiLibs/categories';

export async function seedCategory(categoriesService: CategoriesService) {
  const categories = [
    {
      category: 'Electronics',
    },
    {
      category: 'Clothing',
    },
    {
      category: 'Books',
    },
  ];

  const categoryIds: string[] = [];
  for (const category of categories) {
    const created = await categoriesService.create(category);
    categoryIds.push(created.id);
  }

  return categoryIds;
}

export async function seedSubCategory(
  categoriesService: CategoriesService,
  categoryIds: string[],
) {
  const subCategories = [
    {
      subCategory: 'Smartphones',
      categoryId: categoryIds[0], // Electronics
    },
    {
      subCategory: 'Laptops',
      categoryId: categoryIds[0], // Electronics
    },
    {
      subCategory: 'T-Shirts',
      categoryId: categoryIds[1], // Clothing
    },
    {
      subCategory: 'Fiction',
      categoryId: categoryIds[2], // Books
    },
  ];

  const subCategoryIds: string[] = [];
  for (const subCategory of subCategories) {
    const created = await categoriesService.createSubCategory(subCategory);
    subCategoryIds.push(created.id);
  }

  return subCategoryIds;
}
