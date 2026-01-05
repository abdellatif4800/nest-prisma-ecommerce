import { DynamicModule, Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesPublicController } from './categories.public.controller';
import { PrismaSetupModule } from 'apiLibs/prisma-setup';
import { CategoriesAdminController } from './categories.admin.controller';

@Module({
  imports: [PrismaSetupModule],
  providers: [CategoriesService],
})
export class CategoriesModule {
  static register(mode: 'public' | 'admin'): DynamicModule {
    const controllers =
      mode === 'public'
        ? [CategoriesPublicController]
        : [CategoriesAdminController];

    return {
      module: CategoriesModule,
      controllers: controllers,
    };
  }
}
