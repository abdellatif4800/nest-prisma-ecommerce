import { Module, DynamicModule } from '@nestjs/common';
import { CartManagementService } from './cart-management.service';
import { PrismaSetupModule } from 'apiLibs/prisma-setup';
import { CartManagementAdminController } from './cart-management.admin.controller';
import { CartManagementUsersController } from './cart-management.users.controller';

@Module({
  imports: [PrismaSetupModule],
  exports: [CartManagementService],
  providers: [CartManagementService],
})
export class CartManagementModule {
  static register(mode: 'user' | 'admin'): DynamicModule {
    const controllers =
      mode === 'user'
        ? [CartManagementUsersController]
        : [CartManagementAdminController];

    return {
      module: CartManagementModule,
      controllers: controllers,
    };
  }
}
