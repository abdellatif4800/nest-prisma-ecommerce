import { OrderManagementService } from 'apiLibs/order-management';

export async function seedOrder(
  orderService: OrderManagementService,
  userIds: string[],
) {
  // Create orders for users who have items in cart
  const orders = [
    {
      userId: userIds[0], // john_doe
      createOrderDto: {
        address: '123 Main St, Anytown, USA',
        paymentMethod: 'credit_card',
      },
    },
    {
      userId: userIds[1], // jane_smith
      createOrderDto: {
        address: '456 Oak Ave, Somewhere, USA',
        paymentMethod: 'paypal',
      },
    },
  ];

  for (const order of orders) {
    await orderService.create(order.userId, order.createOrderDto);
  }
}
