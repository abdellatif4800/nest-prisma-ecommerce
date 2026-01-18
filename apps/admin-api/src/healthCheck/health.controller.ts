import { Controller, Get, Logger } from '@nestjs/common';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
  PrismaHealthIndicator,
} from '@nestjs/terminus';
import { IsPublic } from 'apiLibs/common';
import { PrismaSetupService } from 'apiLibs/prisma-setup';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private prismaHealth: PrismaHealthIndicator,
    private prisma: PrismaSetupService,
  ) { }

  @IsPublic(true)
  @Get('prismaCheck')
  @HealthCheck()
  async checkPridma() {
    try {
      const result = await this.prismaHealth.pingCheck('prisma', this.prisma);

      Logger.log('Prisma is UP');
      return result;
    } catch (error) {
      Logger.error('Prisma is DOWN', error.stack);
      throw error;
    }
  }

  @IsPublic(true)
  @Get('apiCheck')
  @HealthCheck()
  async check() {
    try {
      const result = await this.health.check([
        () =>
          this.http.pingCheck('api-test', 'http://localhost:8001/health/ping'),
      ]);
      Logger.log('Api is UP');
      return result;
    } catch (error) {
      Logger.error('API is DOWN', error.stack);
      throw error;
    }
  }

  @IsPublic(true)
  @Get('ping')
  ping() {
    return { status: 'ok' };
  }
}
