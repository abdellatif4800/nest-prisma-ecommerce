import {
  IsEmail,
  IsString,
  IsEnum,
  IsOptional,
  MinLength,
} from 'class-validator';
import { Role } from 'apiLibs/prisma-setup';

// enum Role {
//   USER = 'USER',
//   ADMIN = 'ADMIN',
// }

export class CreateAuthDto {
  @IsString()
  username!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password!: string;

  @IsEnum(Role)
  @IsOptional()
  role?: Role;
}
