import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Currency, ExpenseDetails } from '@prisma/client';
import { PrismaService } from 'nestjs-prisma';
import { ExpenseEntity } from 'src/expenses/entities/expense.entity';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardEntity } from './entities/board.entity';
import { v4 as uid } from 'uuid';
import axios from 'axios';
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
          id: board,
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

  computeDebts(
    allExpenses: (ExpenseEntity & { breakdown: ExpenseDetails[] })[]
  ) {
    // TODO: ideally run that as a trigger and save data somewhere in our db
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
    return allDebts;
  }

  calculBestTransfers(debts: { [key: string]: number }) {
    const transfers: {
      sender: string;
      recipient: string;
      amount: number;
    }[] = [];

    // Looping as long as all the debts haven't been settled
    while (Object.values(debts).some((debt) => debt > 0)) {
      // Look who is a giver and who is a receiver
      const giver = Object.keys(debts).reduce((a, b) =>
        debts[a] < debts[b] ? a : b
      );
      const receiver = Object.keys(debts).reduce((a, b) =>
        debts[a] > debts[b] ? a : b
      );

      let amountTransfered;
      // If debt receiver is supposed to receive is less or equal than what the giver needs to reimburse
      if (debts[receiver] <= -debts[giver]) amountTransfered = debts[receiver];
      // If debt receiver is supposed to receive more than what the giver needs to reimburse, we take giver amount
      else amountTransfered = -debts[giver];

      transfers.push({
        sender: giver,
        recipient: receiver,
        amount: amountTransfered,
      });

      debts[receiver] -= amountTransfered;
      debts[giver] += amountTransfered;
    }
    console.info('Transfers', transfers);
    console.info('Final Debts', debts);

    return transfers;
  }

  async createWiseTransfer(
    senderId: string,
    recipientId: string,
    boardCurrency: Currency,
    amount: number
  ) {
    const [sender, recipient] = await Promise.all([
      this.prisma.user.findUnique({
        where: {
          id: senderId,
        },
      }),
      this.prisma.user.findUnique({
        where: {
          id: recipientId,
        },
      }),
    ]);

    // TODO: check we get all needed Wise info on both profiles
    const baseUrl = 'https://api.sandbox.transferwise.tech';

    console.log('Obj', {
      sourceCurrency: sender.mainCurrency,
      targetCurrency: boardCurrency,
      targetAmount: 10000,
      profileId: sender.wiseProfileId,
    });

    const quote = await axios.post(
      `${baseUrl}/v3/profiles/${sender.wiseProfileId}/quotes`,
      {
        sourceCurrency: sender.mainCurrency,
        targetCurrency: boardCurrency,
        targetAmount: 10000,
        // profileId: sender.wiseProfileId,
      },
      { headers: { Authorization: `Bearer ${sender.wiseToken}` } }
    );

    console.log('Quote', quote);

    // Recipient account
    // TODO: list recipients and see if can find recipient
    const allRecipients = await axios.get(
      `${baseUrl}/v1/accounts?profile=${sender.wiseProfileId}&currency=${boardCurrency}`,
      { headers: { Authorization: `Bearer ${sender.wiseToken}` } }
    );
    console.log('allRecipients', allRecipients);

    let recipientWiseAccount = allRecipients.data.find(
      (obj) => obj.details.email === recipient.email
    );

    // TODO: we don't have bank account of people
    if (!recipientWiseAccount) {
      // TODO: get required key first depending currencies / countries + validation regexp
      // Link example: https://api.sandbox.transferwise.tech/v1/account-requirements?source=USD&target=EUR&sourceAmount=1000
      recipientWiseAccount = await axios.post(
        `${baseUrl}/v1/accounts`,
        {
          currency: boardCurrency,
          type: 'swift_code',
          profile: sender.wiseProfileId,
          accountHolderName: `${recipient.firstname} ${recipient.lastname}`,
          details: {
            legalType: 'PRIVATE',
            swiftCode: 'AGRIFRPPXXX',
            accountNumber: 'FRXXXXXXXXXXXXXXXXXXXXXXXXX',
            sortCode: 'EUR',
            address: {
              country: 'FR',
              city: 'Paris',
              firstline: '4 rue de la verrerie',
              postCode: '75004',
            },
          },
        },
        { headers: { Authorization: `Bearer ${sender.wiseToken}` } }
      );
    }
    recipientWiseAccount = recipientWiseAccount.data;

    // Finally creating the transfer
    // TODO: need a specific UUID and a transfers table to store data
    const transferUid = uid();
    const transfer = await this.prisma.transfer.create({
      data: {
        id: transferUid,
        sender: { connect: { id: sender.id } },
        recipient: { connect: { id: recipient.id } },
        amount,
        currency: boardCurrency,
        status: 'created',
      },
    });

    try {
      const wiseTransfer = await axios.post(
        `${baseUrl}/v1/transfers`,
        {
          targetAccount: recipientWiseAccount.id,
          quoteUuid: quote.data.id,
          customerTransactionId: transferUid,
          details: {
            reference: 'to my friend', // TODO:
            transferPurpose: 'verification.transfers.purpose.pay.bills', // TODO:
            sourceOfFunds: 'verification.source.of.funds.other', // TODO:
          },
        },
        { headers: { Authorization: `Bearer ${sender.wiseToken}` } }
      );
      console.log('wiseTransfer', wiseTransfer.data);
    } catch (err) {
      console.log("Can't create a transfer");
      console.error(err);
    }

    return transfer;
  }
  // TODO: suppose to found the transfer
}
