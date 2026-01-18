import { DynamicModule, forwardRef, Module } from '@nestjs/common';
import { PaymentManagementService } from './payment-management.service';
import { PaymentManagementUserController } from './payment-management.users.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentManagementAdminController } from './payment-management.admin.controller';
import { OrderManagementModule } from 'apiLibs/order-management';
import { PaymentManagementCoreModule } from './payment-management-core.module';

@Module({})
export class PaymentManagementModule {
  static forRootAsync(mode: 'user' | 'admin'): DynamicModule {
    const controllers =
      mode === 'user'
        ? [PaymentManagementUserController]
        : [PaymentManagementAdminController];
    return {
      module: PaymentManagementModule,
      controllers: controllers,
      imports: [PaymentManagementCoreModule],
    };
  }
}
