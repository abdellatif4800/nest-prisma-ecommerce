import { Controller, Get, Param } from '@nestjs/common';
import { FileStorageService } from './file-storage.service';

@Controller('file-storage')
export class FileStoragePublicController {
  constructor(private fileStorageService: FileStorageService) {}

  @Get('listFileInBucket/:bucketName')
  listFileInBucjet(@Param('bucketName') bucketName: string) {
    return this.fileStorageService.listObjectsInBucket(bucketName);
  }

  //--------------------get file----------------
  @Get('fileUrl/:filename')
  getFile(
    @Param('filename') filename: string,
    @Param('bucketName') bucketName: string,
  ) {
    return this.fileStorageService.getFile(filename, bucketName);
  }
}
