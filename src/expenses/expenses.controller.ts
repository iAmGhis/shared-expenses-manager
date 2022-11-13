import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UnauthorizedException,
  Req,
  ValidationPipe,
  Query,
  UsePipes,
} from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth } from '@nestjs/swagger';
import { BoardsService } from 'src/boards/boards.service';
import { GetExpenseDto } from './dto/get-expense.dto';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('expenses')
export class ExpensesController {
  constructor(
    private readonly expensesService: ExpensesService,
    private readonly boardsService: BoardsService
  ) {}

  @Post()
  create(@Req() req, @Body() createExpenseDto: CreateExpenseDto) {
    const allUsersInBoard = this.boardsService.checkUsersInBoard(
      createExpenseDto.boardId,
      createExpenseDto.breakdown.map((breakdown) => breakdown.paidForId)
    );

    if (!allUsersInBoard)
      return new UnauthorizedException(
        'One or more users are not invited to this board'
      );

    return this.expensesService.create(
      createExpenseDto.boardId,
      createExpenseDto.title,
      createExpenseDto.totalAmount,
      createExpenseDto.paidBy,
      createExpenseDto.breakdown,
      req.user.id
    );
  }

  @Get()
  @UsePipes(
    new ValidationPipe({
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    })
  )
  findAllOneBoard(@Query() query: GetExpenseDto) {
    return this.expensesService.findAllOneBoard(query.boardId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.expensesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateExpenseDto: UpdateExpenseDto
  ) {
    return this.expensesService.update(id, updateExpenseDto, req.user.id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.expensesService.remove(id);
  }
}
