import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';
import { InputType, Field } from '@nestjs/graphql';
import { ApiProperty } from '@nestjs/swagger';

@InputType()
export class SignupInput {
  @Field()
  @ApiProperty()
  @IsEmail()
  email: string;

  @Field()
  @ApiProperty()
  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @ApiProperty({ required: false, nullable: true })
  @Field({ nullable: true })
  firstname?: string;

  @ApiProperty({ required: false, nullable: true })
  @Field({ nullable: true })
  lastname?: string;
}
