import {
  Body,
  Controller,
  Get,
  Patch,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ChangePasswordInput } from './dto/change-password.input';
import { UpdateUserInput } from './dto/update-user.input';
import { ChangeWiseTokenInput } from './dto/wise-token.input';
import { UserModel } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}
  @Get('me')
  async me(@Request() req): Promise<UserModel> {
    return req.user;
  }

  @Put('me')
  async updateUser(@Request() req, @Body() newUserData: UpdateUserInput) {
    return this.userService.updateUser(req.user.id, newUserData);
  }

  @Put('me/password')
  async changePassword(
    @Request() req,
    @Body() changePassword: ChangePasswordInput
  ) {
    return this.userService.changePassword(
      req.user.id,
      req.user.password,
      changePassword
    );
  }

  @Patch('me/wise-token')
  async changeWiseToken(
    @Request() req,
    @Body() { token }: ChangeWiseTokenInput
  ) {
    return this.userService.changeWiseToken(req.user.id, token);
  }
}
