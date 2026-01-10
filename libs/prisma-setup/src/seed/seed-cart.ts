import { CartManagementService } from 'apiLibs/cart-management';

export async function seedCartItem(
  cartService: CartManagementService,
  userIds: string[],
  variantIds: string[],
) {
  // Add some items to users' carts
  const cartItems = [
    {
      userID: userIds[0], // john_doe
      variantID: variantIds[0], // iPhone 14 Black
    },
    {
      userID: userIds[0], // john_doe
      variantID: variantIds[3], // T-Shirt
    },
    {
      userID: userIds[1], // jane_smith
      variantID: variantIds[2], // MacBook Pro
    },
  ];

  for (const item of cartItems) {
    await cartService.addItemToCart(item);
  }
}
