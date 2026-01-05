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
import { PrismaSetupService } from 'apiLibs/prisma-setup';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthPayload } from 'apiLibs/common';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaSetupService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async create(createAuthDto: CreateAuthDto) {
    const { password, ...userData } = createAuthDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email: userData.email },
    });
    if (existingUser) throw new ConflictException('Email already in use');

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = this.prisma.user.create({
      data: {
        ...userData,
        password: hashedPassword,
      },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        joinedAt: true,
      },
    });
    //Logger.log(newUser);
    return newUser;
  }

  async findOne(loginAuthDto: LoginAuthDto) {
    const { email, password } = loginAuthDto;
    const targetUser = await this.prisma.user.findUnique({
      where: { email: email },
    });

    if (!targetUser) throw new UnauthorizedException('no use with this email');

    const isPasswordMatch = await bcrypt.compare(password, targetUser.password);

    if (!isPasswordMatch) throw new UnauthorizedException('password incorrect');

    const payload: AuthPayload = {
      sub: targetUser.id,
      username: targetUser.username,
      role: targetUser.role,
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
