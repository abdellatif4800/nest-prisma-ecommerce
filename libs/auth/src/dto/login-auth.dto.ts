import {
  IsOptional,
  IsEnum,
  IsEmail,
  IsString,
  MinLength,
} from 'class-validator';
import { Role } from 'apiLibs/prisma-setup';

export class LoginAuthDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
