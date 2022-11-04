import { IsNotEmpty } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class CreateBoardInput {
  @Field()
  @IsNotEmpty()
  title: string;
}
