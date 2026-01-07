import { Module } from '@nestjs/common';
import { HealthModule } from './healthCheck/health.module';
import { AuthModule } from 'apiLibs/auth';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from 'apiLibs/products';
import { CategoriesModule } from 'apiLibs/categories';
import { PrismaSetupModule } from 'apiLibs/prisma-setup';
import { CartManagementModule } from 'apiLibs/cart-management';
@Module({
  imports: [
    HealthModule,
    PrismaSetupModule,
    AuthModule.register('public'),
    ProductsModule.register('public'),
    CategoriesModule.register('public'),
    CartManagementModule.register('public'),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [],
  providers: [],
})
export class ApiModule {}
