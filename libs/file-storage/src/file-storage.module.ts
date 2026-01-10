import { DynamicModule, Module } from '@nestjs/common';
import { FileStorageService } from './file-storage.service';
import { FileStorageAdminController } from './file-storage.admin.controller';
import { ConfigService } from '@nestjs/config';
import { MINIO_TOKEN } from 'apiLibs/common';
import * as Minio from 'minio';
import { FileStoragePublicController } from './file-storage.public.controller';

@Module({
  exports: [FileStorageService, MINIO_TOKEN],
  imports: [],
  providers: [
    FileStorageService,
    {
      inject: [ConfigService],
      provide: MINIO_TOKEN,
      useFactory: (configService: ConfigService): Minio.Client => {
        return new Minio.Client({
          endPoint: configService.getOrThrow('MINIO_ENDPOINT'),
          port: +configService.getOrThrow('MINIO_PORT'),
          accessKey: configService.getOrThrow('MINIO_ACCESS_KEY'),
          secretKey: configService.getOrThrow('MINIO_SECRET_KEY'),
          useSSL: false,
        });
      },
    },
  ],
})
export class FileStorageModule {
  static register(mode: 'public' | 'admin'): DynamicModule {
    const controllers =
      mode === 'public'
        ? [FileStoragePublicController]
        : [FileStorageAdminController];

    return {
      module: FileStorageModule,
      controllers: controllers,
    };
  }
}
