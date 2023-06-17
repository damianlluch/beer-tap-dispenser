import {Injectable, UnauthorizedException} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from './user.service';
import {LoginInterface} from "./user.interface";

@Injectable()
export class AuthService {
  constructor(
      private jwtService: JwtService,
      private userService: UserService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    try {
      const user = await this.userService.findByUsername(username);

      if (!user) {
        return null;
      }

      const passwordsMatch = await bcrypt.compare(pass, user.password);

      if (passwordsMatch) {
        return user;
      }
    } catch (error) {
      throw error;
    }

    return null;
  }

  async login(userDto: LoginInterface) {
    const user = await this.validateUser(userDto.username, userDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { username: user.username, sub: user._id };
    return {
      access_token: this.jwtService.sign(payload, {
        expiresIn: '1h',
      }),
      user,
    };
  }
}
