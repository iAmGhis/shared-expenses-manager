import { Body, Controller, Get, Put, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ChangePasswordInput } from './dto/change-password.input';
import { UpdateUserInput } from './dto/update-user.input';
import { UserModel } from './models/user.model';
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
}
