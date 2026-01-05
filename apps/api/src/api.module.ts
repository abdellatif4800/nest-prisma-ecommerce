import { Module } from '@nestjs/common';
import { HealthModule } from './healthCheck/health.module';
import { AuthModule } from 'apiLibs/auth';
import { ConfigModule } from '@nestjs/config';
import { ProductsModule } from 'apiLibs/products';
import { CategoriesModule } from 'apiLibs/categories';
import { PrismaSetupModule } from 'apiLibs/prisma-setup';

@Module({
  imports: [
    HealthModule,
    AuthModule,
    PrismaSetupModule,
    ProductsModule.register('public'),
    CategoriesModule.register('public'),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [],
  providers: [],
})
export class ApiModule {}
