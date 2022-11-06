import 'reflect-metadata';
import { ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';
import { BaseModel } from 'src/common/models/base.model';
import { Role, User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

registerEnumType(Role, {
  name: 'Role',
  description: 'User role',
});

@ObjectType()
export class UserModel extends BaseModel implements User {
  @ApiProperty({ type: () => String, nullable: true })
  @IsEmail()
  email: string;

  @ApiProperty({ type: () => String, nullable: true })
  firstname: string;

  @ApiProperty({ type: () => String, nullable: true })
  lastname: string;

  @ApiProperty({ enum: Role })
  role: Role;

  // @Field(() => [Board], { nullable: true })
  // boards?: [Board] | null;
  //
  // TODO: hide from response
  @ApiProperty({ type: () => String, nullable: true })
  password: string;
}
