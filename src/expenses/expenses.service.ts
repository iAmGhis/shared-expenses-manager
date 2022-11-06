import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { BoardsService } from 'src/boards/boards.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly board: BoardsService
  ) {}

  async create(
    boardId: string,
    title: string,
    totalAmount: number,
    paidBy: string,
    breakdown: { paidForId: string; amount: number }[],
    authorId: string
  ) {
    if (!this.board.checkUsersInBoard(boardId, [authorId]))
      throw new UnauthorizedException('User is not part of the board');

    // TODO: return error if total amount !== sum(breakdown)
    return this.prisma.expense.create({
      data: {
        board: { connect: { id: boardId } },
        title: title,
        breakdown: {
          createMany: {
            data: breakdown,
          },
        },
        paidBy: { connect: { id: paidBy } },
        author: { connect: { id: authorId } },
        totalAmount: totalAmount,
      },
      include: { breakdown: true },
    });
  }

  findAllOneBoard(boardId) {
    return this.prisma.expense.findMany({
      where: {
        boardId: boardId,
      },
    });
  }

  async findOne(id: string) {
    // TODO: add user id filtering
    const expense = await this.prisma.expense.findUnique({
      where: {
        id,
      },
      include: {
        breakdown: true,
        board: { select: { id: true, users: { select: { id: true } } } },
      },
    });
    if (!expense) throw new NotFoundException(`No expense found with id ${id}`);
    return expense;
  }

  async update(id: string, updateExpenseDto: UpdateExpenseDto, userId: string) {
    // TODO: add user id filtering
    const expenseToUpdate = await this.prisma.expense.findFirst({
      where: { id },
      include: { board: { select: { users: { select: { id: true } } } } },
    });
    if (!expenseToUpdate) throw new NotFoundException(`No board found`);

    if (expenseToUpdate.authorId !== userId) throw new UnauthorizedException();
    const { breakdown, title, totalAmount } = updateExpenseDto;
    return this.prisma.expense.update({
      where: {
        id,
      },
      data: {
        paidBy: { connect: { id: updateExpenseDto.paidBy } },
        breakdown: {
          update: breakdown.map((item) => {
            return {
              where: { id: item.id },
              data: { amount: item.amount },
            };
          }),
        },
        totalAmount,
        title,
        updatedAt: new Date(),
      },
      include: { breakdown: true },
    });
  }

  async remove(id: string) {
    // TODO: add user id filtering
    return this.prisma.expense.delete({ where: { id } });
  }
}
