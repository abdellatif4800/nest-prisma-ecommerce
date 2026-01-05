import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { HttpModule } from '@nestjs/axios';
import { PrismaSetupModule } from 'apiLibs/prisma-setup';

@Module({
  imports: [TerminusModule, HttpModule, PrismaSetupModule],
  controllers: [HealthController],
})
export class HealthModule {}
