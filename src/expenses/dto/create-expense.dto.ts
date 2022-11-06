import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsInt } from 'class-validator';

export class CreateExpenseDto {
  @IsNotEmpty()
  @ApiProperty()
  boardId: string;

  @IsNotEmpty()
  @ApiProperty()
  title: string;

  @IsInt()
  @ApiProperty({ required: true })
  totalAmount: number;

  @IsNotEmpty()
  @ApiProperty()
  paidBy: string;

  @ApiProperty()
  breakdown: ExpenseDetailDto[];
}

class ExpenseDetailDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  paidForId: string;

  @ApiProperty()
  @IsInt()
  amount: number;
}
