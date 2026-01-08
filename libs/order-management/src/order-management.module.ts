import { DynamicModule, Module } from '@nestjs/common';
import { OrderManagementService } from './order-management.service';
import { OrderManagementUserController } from './order-management.user.controller';
import { OrderManagementAdminController } from './order-management.admin.controller';
import { PrismaSetupModule } from 'apiLibs/prisma-setup';
import { CartManagementModule } from 'apiLibs/cart-management';
import { ProductsModule } from 'apiLibs/products';

@Module({
  imports: [PrismaSetupModule, CartManagementModule, ProductsModule],
  providers: [OrderManagementService],
})
export class OrderManagementModule {
  static register(mode: 'user' | 'admin'): DynamicModule {
    const controllers =
      mode === 'user'
        ? [OrderManagementUserController]
        : [OrderManagementAdminController];

    return {
      module: OrderManagementModule,
      controllers: controllers,
    };
  }
}
