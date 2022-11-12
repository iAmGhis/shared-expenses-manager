import { InputType, PickType } from '@nestjs/graphql';
import { SignupInput } from 'src/auth/dto/signup.input';

@InputType()
export class UpdateUserInput extends PickType(SignupInput, [
  'firstname',
  'lastname',
] as const) {}
