import { forwardRef, Module } from '@nestjs/common';
import { PaymentManagementService } from './payment-management.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  OrderManagementModule,
  OrderManagementService,
} from 'apiLibs/order-management';

@Module({
  imports: [ConfigModule.forRoot(), forwardRef(() => OrderManagementModule)],
  providers: [
    PaymentManagementService,
    {
      provide: 'STRIPE_API_KEY',
      useFactory: (configService: ConfigService) =>
        configService.get<string>('STRIPE_API_KEY'),
      inject: [ConfigService],
    },
  ],
  exports: [PaymentManagementService], // <-- export it
})
export class PaymentManagementCoreModule { }
