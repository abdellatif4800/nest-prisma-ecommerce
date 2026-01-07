import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from 'apiLibs/auth';
import { CategoriesModule } from 'apiLibs/categories';
import { PrismaSetupModule } from 'apiLibs/prisma-setup';
import { ProductsModule } from 'apiLibs/products';
import { HealthModule } from './healthCheck/health.module';
import { AuthGuard, RoleGuard } from 'apiLibs/common';
import { APP_GUARD } from '@nestjs/core';
import { CartManagementModule } from 'apiLibs/cart-management';

@Module({
  imports: [
    HealthModule,
    PrismaSetupModule,
    AuthModule.register('admin'),
    ProductsModule.register('admin'),
    CategoriesModule.register('admin'),
    CartManagementModule.register('admin'),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
  ],
})
export class AdminApiModule {}
