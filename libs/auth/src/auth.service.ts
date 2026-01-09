import {
  Injectable,
  ConflictException,
  // Logger,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
// import { UpdateAuthDto } from './dto/update-auth.dto';
import * as bcrypt from 'bcrypt';
import { LoginAuthDto } from './dto/login-auth.dto';
import { Role, PrismaSetupService } from 'apiLibs/prisma-setup';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserAuthPayload, AdminAuthPayload } from 'apiLibs/common';
import { log } from 'node:console';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaSetupService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async createUser(createAuthDto: CreateAuthDto) {
    const { password, ...userData } = createAuthDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) throw new ConflictException('Email already in use');

    const newUser = this.prisma.user.create({
      data: {
        ...userData,
        id: 'user-101', //for dev only

        password: await bcrypt.hash(password, 10),

        role: Role.user,

        cart: {
          create: {},
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        joinedAt: true,
        role: true,
        cart: {
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });
    return newUser;
  }

  async findUser(loginAuthDto: LoginAuthDto) {
    const { email, password } = loginAuthDto;

    const targetUser = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (!targetUser) throw new UnauthorizedException('no use with this email');

    const isPasswordMatch = await bcrypt.compare(password, targetUser.password);

    if (!isPasswordMatch) throw new UnauthorizedException('password incorrect');

    const payload: UserAuthPayload = {
      sub: targetUser.id,
      username: targetUser.username,
      role: 'user',
      email: targetUser.email,
      cartID: 'adasd',
    };

    if (isPasswordMatch)
      return { access_token: await this.jwtService.signAsync(payload) };
  }
  ///------------------------ADMIN-----------------------------------------------
  async createAdmin(createAuthDto: CreateAuthDto) {
    const { password, ...userData } = createAuthDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (existingUser) throw new ConflictException('Email already in use');

    const newUser = this.prisma.user.create({
      data: {
        ...userData,

        password: await bcrypt.hash(password, 10),

        role: Role.admin,
      },
      select: {
        id: true,
        username: true,
        email: true,
        joinedAt: true,
        role: true,
      },
    });
    return newUser;
  }

  async findAdmin(loginAuthDto: LoginAuthDto) {
    const { email, password, role } = loginAuthDto;

    const targetUser = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (!targetUser) throw new UnauthorizedException('no use with this email');

    const isPasswordMatch = await bcrypt.compare(password, targetUser.password);

    if (!isPasswordMatch) throw new UnauthorizedException('password incorrect');

    if (role !== targetUser.role)
      throw new UnauthorizedException('You are  not admin');

    const payload: AdminAuthPayload = {
      sub: targetUser.id,
      username: targetUser.username,
      role: 'admin',
      email: targetUser.email,
    };
    if (isPasswordMatch)
      return { access_token: await this.jwtService.signAsync(payload) };
  }

  //
  // findAll() {
  //   return `This action returns all auth`;
  // }

  // update(id: number, updateAuthDto: UpdateAuthDto) {
  //   return `This action updates a #${id} auth`;
  // }
  //
  // remove(id: number) {
  //   return `This action removes a #${id} auth`;
  // }
}
