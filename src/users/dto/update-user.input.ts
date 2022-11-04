import { InputType, Field, PartialType, PickType } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { SignupInput } from 'src/auth/dto/signup.input';

@InputType()
export class UpdateUserInput extends PickType(SignupInput, [
  'firstname',
  'lastname',
] as const) {}
