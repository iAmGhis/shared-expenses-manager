import { Module } from '@nestjs/common';
import { BoardsResolver } from './boards.resolver';

@Module({
  imports: [],
  providers: [BoardsResolver],
})
export class BoardsModule {}
