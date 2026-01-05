import { DynamicModule, Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { PrismaSetupModule } from 'apiLibs/prisma-setup';
import { ProductsAdminController } from './products.admin.controller';
import { ProductsPublicController } from './products.public.controller';

@Module({
  imports: [PrismaSetupModule],
  providers: [ProductsService],
})
export class ProductsModule {
  static register(mode: 'public' | 'admin'): DynamicModule {
    const controllers =
      mode === 'public'
        ? [ProductsPublicController]
        : [ProductsAdminController];

    return {
      module: ProductsModule,
      controllers: controllers,
    };
  }
}
