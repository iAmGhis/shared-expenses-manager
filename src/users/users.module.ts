import { Module } from '@nestjs/common';
import { UsersResolver } from './users.resolver';
import { UsersService } from './users.service';
import { UserController } from './users.controller';
import { PasswordService } from 'src/auth/password.service';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UsersResolver, UsersService, PasswordService],
})
export class UsersModule {}
