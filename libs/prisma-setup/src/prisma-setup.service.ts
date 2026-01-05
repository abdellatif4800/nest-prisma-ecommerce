import { OnModuleInit, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generatedClient/client';

@Injectable()
export class PrismaSetupService extends PrismaClient implements OnModuleInit {
  constructor(private configService: ConfigService) {
    // const connectionString = configService.get<string>('DATABASE_URL');
    const connectionString = process.env.DATABASE_URL;
    const pool = new PrismaPg({ connectionString: connectionString });
    super({ adapter: pool });
  }
  async onModuleInit() {
    // const connectionString = configService.get<string>('DATABASE_URL');
    // Note: this is optional
    await this.$connect();
  }
}
