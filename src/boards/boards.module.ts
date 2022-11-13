import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { ExpensesService } from 'src/expenses/expenses.service';

@Module({
  controllers: [BoardsController],
  providers: [BoardsService, ExpensesService],
})
export class BoardsModule {}
