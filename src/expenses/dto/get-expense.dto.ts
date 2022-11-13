import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class GetExpenseDto {
  @IsNotEmpty()
  @ApiProperty()
  boardId: string;
}
