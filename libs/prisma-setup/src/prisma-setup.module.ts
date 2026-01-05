import { Module } from '@nestjs/common';
import { PrismaSetupService } from './prisma-setup.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [PrismaSetupService],
  exports: [PrismaSetupService],
})
export class PrismaSetupModule {}
