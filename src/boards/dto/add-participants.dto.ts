import { PickType } from '@nestjs/swagger';
import { CreateBoardDto } from './create-board.dto';

export class AddParticipantsDto extends PickType(CreateBoardDto, [
  'users',
] as const) {}
