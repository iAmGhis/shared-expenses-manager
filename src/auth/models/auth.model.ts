import { ObjectType } from '@nestjs/graphql';
import { UserModel } from 'src/users/entities/user.entity';
import { Token } from './token.model';
import { ApiProperty } from '@nestjs/swagger';

@ObjectType()
export class Auth extends Token {
  @ApiProperty({ type: () => UserModel })
  user: Omit<UserModel, 'password'>;
}
