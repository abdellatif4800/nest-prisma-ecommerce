import { ProductsService } from 'apiLibs/products';

export async function seedProduct(
  productsService: ProductsService,
  subCategoryIds: string[],
) {
  const products = [
    {
      productName: 'iPhone 14',
      price: 999,
      discount: 10,
      imageUrl: 'https://example.com/iphone14.jpg',
      publish: true,
      subCategoryId: subCategoryIds[0], // Smartphones
    },
    {
      productName: 'MacBook Pro',
      price: 1999,
      discount: 5,
      imageUrl: 'https://example.com/macbook.jpg',
      publish: true,
      subCategoryId: subCategoryIds[1], // Laptops
    },
    {
      productName: 'Cotton T-Shirt',
      price: 29,
      discount: 0,
      imageUrl: 'https://example.com/tshirt.jpg',
      publish: true,
      subCategoryId: subCategoryIds[2], // T-Shirts
    },
  ];

  const productIds: string[] = [];
  for (const product of products) {
    const created = await productsService.create(product);
    productIds.push(created.id);
  }

  return productIds;
}

export async function seedProductVariant(
  productsService: ProductsService,
  productIds: string[],
) {
  const variants = [
    {
      color: 'Black',
      size: '128GB',
      stock: 50,
      price: 999,
      productId: productIds[0], // iPhone 14
    },
    {
      color: 'White',
      size: '256GB',
      stock: 30,
      price: 1099,
      productId: productIds[0], // iPhone 14
    },
    {
      color: 'Space Gray',
      size: '16-inch',
      stock: 20,
      price: 1999,
      productId: productIds[1], // MacBook Pro
    },
    {
      color: 'Blue',
      size: 'M',
      stock: 100,
      price: 29,
      productId: productIds[2], // T-Shirt
    },
  ];

  const variantIds: string[] = [];
  for (const variant of variants) {
    const created = await productsService.createVariant(variant);
    variantIds.push(created.id);
  }

  return variantIds;
}
