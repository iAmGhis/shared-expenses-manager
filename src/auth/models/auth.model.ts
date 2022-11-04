import { ObjectType } from '@nestjs/graphql';
import { User } from 'src/users/models/user.model';
import { Token } from './token.model';
import { ApiProperty } from '@nestjs/swagger';

@ObjectType()
export class Auth extends Token {
  @ApiProperty({ type: () => User })
  user: User;
}
