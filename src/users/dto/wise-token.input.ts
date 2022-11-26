import { InputType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

@InputType()
export class ChangeWiseTokenInput {
  @ApiProperty()
  @Field()
  @IsNotEmpty()
  token: string;
}
