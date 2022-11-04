import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Currency } from '@prisma/client';

export class CreateBoardDto {
  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @ApiProperty({ default: true, required: false })
  published: boolean;

  @ApiProperty({ required: true })
  currency: Currency;
}
