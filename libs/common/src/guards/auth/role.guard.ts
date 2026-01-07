import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import {
  AdminAuthPayload,
  UserAuthPayload,
} from 'apiLibs/common/models/auth/auth.interface';
import { IsPublic } from 'apiLibs/common/decorators/is-public.decorator';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.get(IsPublic, context.getHandler());
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();

    const user = request['user'] as AdminAuthPayload | UserAuthPayload;

    if (!user) {
      throw new ForbiddenException('token required');
    }

    if (user.role !== 'admin') {
      throw new ForbiddenException('Insufficient role');
    }

    return true;
  }
}
