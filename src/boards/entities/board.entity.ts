import { ApiProperty } from '@nestjs/swagger';
import { Board, Currency } from '@prisma/client';

export class BoardEntity implements Board {
  @ApiProperty()
  id: string;
  @ApiProperty()
  createdAt: Date;
  @ApiProperty()
  updatedAt: Date;
  @ApiProperty()
  published: boolean;
  @ApiProperty()
  title: string;
  @ApiProperty()
  authorId: string;
  @ApiProperty({ enum: Currency })
  currency: Currency;
}
