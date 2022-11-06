import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardEntity } from './entities/board.entity';

@Injectable()
export class BoardsService {
  constructor(private prisma: PrismaService) {}

  create(boardData: CreateBoardDto, authorId: string) {
    return this.prisma.board.create({
      data: {
        ...boardData,
        authorId,
        createdAt: new Date(),
        updatedAt: new Date(),
        users: { connect: { id: authorId } },
      },
    });
  }

  findUserBoards(userId: string) {
    return this.prisma.board.findMany({
      where: {
        authorId: userId,
      },
    });
  }

  async findOne(id: string, userId: string) {
    const board = await this.prisma.board.findUnique({
      where: {
        id,
      },
      include: { users: true },
    });
    if (!board) throw new NotFoundException(`No board found`);
    if (board.authorId !== userId) throw new UnauthorizedException();
    return board;
  }

  async update(id: string, updateBoardDto: UpdateBoardDto, userId: string) {
    // TODO: can replace by single query when new version of prisma is out
    const boardToUpdate = await this.prisma.board.findFirst({ where: { id } });
    if (!boardToUpdate) throw new NotFoundException(`No board found`);

    if (boardToUpdate.authorId !== userId) throw new UnauthorizedException();

    return this.prisma.board.update({
      where: {
        id,
      },
      data: {
        ...updateBoardDto,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: string, userId: string) {
    // TODO: can replace by single query when new version of prisma is out
    const boardToDel = await this.prisma.board.findFirst({ where: { id } });
    if (!boardToDel) throw new NotFoundException(`No board found`);
    if (boardToDel.authorId !== userId) throw new UnauthorizedException();

    return this.prisma.board.delete({
      where: {
        id,
      },
    });
  }

  async checkUsersInBoard(board: string | BoardEntity, userdIds: string[]) {
    let boardData = null;
    if (board instanceof BoardEntity) {
      boardData = board;
    } else {
      boardData = await this.prisma.board.findUnique({
        where: {
          id: board as string,
        },
        include: { users: { select: { id: true } } },
      });
    }

    if (!boardData) throw new NotFoundException(`No board found`);
    return userdIds.every((val) => boardData.users.some((o) => o.id === val));
  }

  async addParticipants(id: string, userIds: string[]) {
    const board = await this.prisma.board.update({
      where: {
        id,
      },
      data: {
        users: {
          connect: userIds.map((userId) => {
            return { id: userId };
          }),
        },
      },
      include: { users: true },
    });

    if (!board) throw new NotFoundException(`No board found`);
    return board;
  }

  async computeDebts(boardId: string) {
    // TODO: ideally run that as a trigger and save data somewhere in our db
    const allExpenses = await this.prisma.expense.findMany({
      where: {
        boardId,
      },
      include: { breakdown: true },
    });

    const allDebts = {};

    // Calculate balance for everyone
    allExpenses.forEach((expense) => {
      expense.breakdown.forEach((expenseUserItem) => {
        // User that has been borrowed money: subtracting from balance
        if (allDebts[expenseUserItem.paidForId])
          allDebts[expenseUserItem.paidForId] -= expenseUserItem.amount;
        else allDebts[expenseUserItem.paidForId] = -expenseUserItem.amount;

        // User that has paid: adding to balance
        if (allDebts[expense.paidById])
          allDebts[expense.paidById] += expenseUserItem.amount;
        else allDebts[expense.paidById] = expenseUserItem.amount;
      });
    });
    // return allDebts;

    // Look who is a giver and who is a receiver
    const giver = Object.keys(allDebts).reduce((a, b) =>
      allDebts[a] < allDebts[b] ? a : b
    );
    const receiver = Object.keys(allDebts).reduce((a, b) =>
      allDebts[a] > allDebts[b] ? a : b
    );

    const transfers = {};

    console.log('All debts first', allDebts);

    // FIXME: infinite loop
    // Looping as long as all the debts haven't been settled
    while (Object.values(allDebts).some((debt) => debt > 0)) {
      console.log('All debts beg while', allDebts);
      // If debt receiver is supposed to receive is less or equal than what the giver needs to reimburse
      if (allDebts[receiver] <= -allDebts[giver]) {
        const amountTransfered = allDebts[receiver];
        transfers[giver] = {
          ...transfers[giver],
          [receiver]: amountTransfered,
        };
        allDebts[receiver] -= amountTransfered;
        allDebts[giver] += amountTransfered;
      }
      // If debt receiver is supposed to receive more than what the giver needs to reimburse, we take giver amoutn
      else {
        const amountTransfered = allDebts[giver];
        transfers[giver] = {
          ...transfers[giver],
          [receiver]: amountTransfered,
        };
        allDebts[receiver] -= amountTransfered;
        allDebts[giver] += amountTransfered;
      }

      console.log('All debts end while', allDebts);
    }

    return transfers;
  }
}
