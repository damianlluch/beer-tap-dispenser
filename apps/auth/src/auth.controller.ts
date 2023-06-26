import { Controller, Post, Body, Req, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from './user.service';
import { User } from './user.schema';
import * as bcrypt from 'bcrypt';
import {LoginDto, RegisterDto} from "./user.dto";
import {ApiBody, ApiOperation, ApiResponse, ApiTags} from "@nestjs/swagger";

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
      private readonly authService: AuthService,
      private readonly userService: UserService,
  ) {}

  @Post('/register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'User successfully registered', type: User })
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
  @ApiOperation({ summary: 'Log in a user' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: HttpStatus.OK, description: 'User successfully logged in' })
  async login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }
}
