import { Injectable } from '@nestjs/common';
import { InjectMinio } from 'apiLibs/common';
import { log } from 'console';
import * as Minio from 'minio';

@Injectable()
export class FileStorageService {
  constructor(@InjectMinio() private readonly minioService: Minio.Client) {}

  async createBuckt(bucketName: string) {
    await this.minioService.makeBucket(bucketName);
    console.log('Bucket created successfully.');
  }

  async bucketsList() {
    return await this.minioService.listBuckets();
  }

  async listObjectsInBucket(bucketName: string): Promise<any[]> {
    const data: any[] = [];
    const stream = this.minioService.listObjects(bucketName, '', true);
    for await (const obj of stream) {
      data.push(obj);
    }
    return data;
  }

  async getFile(filename: string, bucketName: string) {
    return await this.minioService.presignedGetObject(
      bucketName,
      filename,
      3600,
    );
  }

  async uploadFile(file: Express.Multer.File, bucketName: string) {
    const newFile = await this.minioService.putObject(
      bucketName,
      file.originalname,
      file.buffer,
      file.size,
      function (err, etag) {
        return console.log(err, etag);
      },
    );
    log(newFile);
    return newFile;
  }
}
