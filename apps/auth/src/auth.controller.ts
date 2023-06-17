import { Controller, Post, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';
import {LoginDto, RegisterDto} from "./user.dto";

@Controller('auth')
export class AuthController {
  constructor(
      private readonly authService: AuthService,
      private readonly userService: UserService,
  ) {}

  @Post('/register')
  async register(@Body() user: RegisterDto) {
    const hashedPassword = await bcrypt.hash(user.password, 12);

    const newUser: User = {
      ...user,
      username: user.username,
      password: hashedPassword,
    };

    const result = await this.userService.create(newUser);
    return result;
  }

  @HttpCode(HttpStatus.OK)
  @Post('/login')
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
}
