import 'reflect-metadata';
import { ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';
// import { Board } from 'src/boards/models/board.model';
import { BaseModel } from 'src/common/models/base.model';
import { Role } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

registerEnumType(Role, {
  name: 'Role',
  description: 'User role',
});

@ObjectType()
export class User extends BaseModel {
  @ApiProperty({ type: () => String, nullable: true })
  @IsEmail()
  email: string;

  @ApiProperty({ type: () => String, nullable: true })
  firstname?: string;

  @ApiProperty({ type: () => String, nullable: true })
  lastname?: string;

  // TODO: infer type cause circular dependency
  @ApiProperty()
  role: Role;

  // @Field(() => [Board], { nullable: true })
  // boards?: [Board] | null;

  // TODO: hide from response
  @ApiProperty({ type: () => String, nullable: true })
  password: string;
}
