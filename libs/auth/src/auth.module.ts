import { Module, DynamicModule } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthPublicController } from './auth.public.controller';
import { PrismaSetupModule } from 'apiLibs/prisma-setup';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthAdminController } from './auth.admin.controller';

@Module({
  imports: [
    PrismaSetupModule,
    JwtModule.registerAsync({
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '15m' },
      }),
    }),
  ],
  providers: [AuthService, ConfigService],
})
export class AuthModule {
  static register(mode: 'public' | 'admin'): DynamicModule {
    const controllers =
      mode === 'public' ? [AuthPublicController] : [AuthAdminController];

    return {
      module: AuthModule,
      controllers: controllers,
    };
  }
}
