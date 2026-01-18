import type { Role } from 'apiLibs/prisma-setup';

interface BaseAuthPayload {
  sub: string;
  username: string;
  email: string;
  role: Role;
}

export interface UserAuthPayload extends BaseAuthPayload {
  role: 'user';
  cartID: string | null;
}

export interface AdminAuthPayload extends BaseAuthPayload {
  role: 'admin';
}

export type AuthUserPayload = UserAuthPayload | AdminAuthPayload;
