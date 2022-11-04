import { Controller, Body, Post } from '@nestjs/common';
import { Parent } from '@nestjs/graphql';
import { User } from 'src/users/models/user.model';

import { AuthService } from './auth.service';
import { LoginInput } from './dto/login.input';
import { RefreshTokenInput } from './dto/refresh-token.input';
import { SignupInput } from './dto/signup.input';
import { Auth } from './models/auth.model';

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}
  @Post('login')
  async login(@Body() credentials: LoginInput): Promise<Auth> {
    const { accessToken, refreshToken } = await this.auth.login(
      credentials.email.toLowerCase(),
      credentials.password
    );

    const user = await this.auth.getUserFromToken(accessToken);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  @Post('signup')
  async signup(@Body() signUpPayload: SignupInput): Promise<Auth> {
    const { accessToken, refreshToken } = await this.auth.createUser(
      signUpPayload
    );

    const user = await this.auth.getUserFromToken(accessToken);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  @Post('refreshed-tokens')
  async refreshToken(@Body() { token }: RefreshTokenInput) {
    return this.auth.refreshToken(token);
  }
}
