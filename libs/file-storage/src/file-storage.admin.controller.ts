import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Express, Response } from 'express';
import { FileStorageService } from './file-storage.service';

@Controller('file-storage')
export class FileStorageAdminController {
  constructor(private fileStorageService: FileStorageService) {}

  //---------------Buckets-----------------------
  @Post('createBuckt')
  async createBucket(@Body() bucketName: string) {
    return this.fileStorageService.createBuckt(bucketName);
  }

  @Get('listBuckets')
  bucketsList() {
    return this.fileStorageService.bucketsList();
  }

  //------------------upload file----------------
  @Post('uploadFile')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('bucketName') bucketName: string,
  ) {
    return this.fileStorageService.uploadFile(file, bucketName);
  }
}
