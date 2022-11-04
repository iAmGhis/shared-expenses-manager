import { ObjectType } from '@nestjs/graphql';
import PaginatedResponse from 'src/common/pagination/pagination';
import { Board } from './board.model';

@ObjectType()
export class BoardConnection extends PaginatedResponse(Board) {}
