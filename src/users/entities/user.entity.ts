import 'reflect-metadata';
import { ObjectType, registerEnumType } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';
import { BaseModel } from 'src/common/models/base.model';
import { Currency, Role, User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

registerEnumType(Role, {
  name: 'Role',
  description: 'User role',
});

registerEnumType(Currency, {
  name: 'Currency',
  description: 'Currencies for expenses and transfers',
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

  @ApiProperty({ type: () => String, nullable: true })
  password: string;

  @ApiProperty({ type: () => String, nullable: true })
  wiseToken: string;

  @ApiProperty({ type: () => String, nullable: true })
  wiseProfileId: string;

  @ApiProperty({ enum: Currency, default: Currency.USD })
  mainCurrency: Currency;
}
