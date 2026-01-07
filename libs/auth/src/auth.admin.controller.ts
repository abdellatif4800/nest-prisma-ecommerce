import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { LoginAuthDto } from './dto/login-auth.dto';
import { IsPublic } from 'apiLibs/common';

@Controller('auth')
export class AuthAdminController {
  constructor(private readonly authService: AuthService) {}

  @IsPublic(true)
  @Post('registration')
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.createAdmin(createAuthDto);
  }

  @IsPublic(true)
  @Post('login')
  findOne(@Body() loginAuthDto: LoginAuthDto) {
    return this.authService.findAdmin(loginAuthDto);
  }

  // @Get()
  // findAll() {
  //   return this.authService.findAll();
  // }
  //
  //
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
  //   return this.authService.update(+id, updateAuthDto);
  // }
  //
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
}
