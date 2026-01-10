import { AuthService } from 'apiLibs/auth';
import { CategoriesService } from 'apiLibs/categories';
import { ProductsService } from 'apiLibs/products';
import { CartManagementService } from 'apiLibs/cart-management';
import { OrderManagementService } from 'apiLibs/order-management';

import { seedUser, seedAdmin } from './seed-user';
import { seedCategory, seedSubCategory } from './seed-category';
import { seedProduct, seedProductVariant } from './seed-product';
import { seedCartItem } from './seed-cart';
import { seedOrder } from './seed-order';

export async function seedAll(
  authService: AuthService,
  categoriesService: CategoriesService,
  productsService: ProductsService,
  cartService: CartManagementService,
  orderService: OrderManagementService,
) {
  console.log('Starting database seeding...');

  // Seed users and admins
  console.log('Seeding users...');
  const userIds = await seedUser(authService);
  await seedAdmin(authService);

  // Seed categories and subcategories
  console.log('Seeding categories...');
  const categoryIds = await seedCategory(categoriesService);
  const subCategoryIds = await seedSubCategory(categoriesService, categoryIds);

  // Seed products and variants
  console.log('Seeding products...');
  const productIds = await seedProduct(productsService, subCategoryIds);
  const variantIds = await seedProductVariant(productsService, productIds);

  // Seed cart items
  console.log('Seeding cart items...');
  await seedCartItem(cartService, userIds, variantIds);

  // Seed orders
  console.log('Seeding orders...');
  await seedOrder(orderService, userIds);

  console.log('Seeding complete!');
}
