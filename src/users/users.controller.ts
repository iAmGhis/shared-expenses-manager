import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UsersService) {}

  @Get('hello/:name')
  getHelloName(@Param('name') name: string): string {
    return 'test';
  }
}
