import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { BoardsService } from 'src/boards/boards.service';

@Module({
  controllers: [ExpensesController],
  providers: [ExpensesService, BoardsService],
})
export class ExpensesModule {}
