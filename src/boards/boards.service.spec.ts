import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'nestjs-prisma';
import { BoardsService } from './boards.service';
import { mockDeep } from 'jest-mock-extended';
import { Expense, ExpenseDetails, PrismaClient } from '@prisma/client';
import { v4 as uid } from 'uuid';

describe('BoardsService', () => {
  let boardService: BoardsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BoardsService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    boardService = module.get<BoardsService>(BoardsService);
  });

  // DATA
  const expensesIds = [uid(), uid(), uid(), uid()];
  const usersId = [uid(), uid(), uid()];

  const userDebts = [
    200 - 0 - 212 - 2000, // - 2012
    -200 + 424 - 212 + 10128 - 4128, // 6012
    0 + 0 - 4000, // - 4000
  ];
  const transfersRes = {
    [usersId[0]]: {
      [usersId[1]]: 2012,
    },
    [usersId[2]]: {
      [usersId[1]]: 4000,
    },
  };

  const boardId = uid();

  const expenses: (Expense & { breakdown: ExpenseDetails[] })[] = [
    {
      id: expensesIds[0],
      title: 'Expense 1',
      totalAmount: 200,
      createdAt: new Date(),
      updatedAt: new Date(),
      authorId: usersId[0],
      boardId,
      paidById: usersId[0],
      breakdown: [
        {
          id: uid(),
          amount: 200,
          expenseId: expensesIds[0],
          paidForId: usersId[1],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uid(),
          amount: 0,
          expenseId: expensesIds[0],
          paidForId: usersId[0],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
    {
      id: expensesIds[1],
      title: 'Expense 1',
      totalAmount: 424,
      createdAt: new Date(),
      updatedAt: new Date(),
      authorId: usersId[1],
      boardId,
      paidById: usersId[1],
      breakdown: [
        {
          id: uid(),
          amount: 212,
          expenseId: expensesIds[1],
          paidForId: usersId[0],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uid(),
          amount: 212,
          expenseId: expensesIds[1],
          paidForId: usersId[1],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
    {
      id: expensesIds[2],
      title: 'Expense 2',
      totalAmount: 10128,
      createdAt: new Date(),
      updatedAt: new Date(),
      authorId: usersId[1],
      boardId,
      paidById: usersId[1],
      breakdown: [
        {
          id: uid(),
          amount: 2000,
          expenseId: expensesIds[2],
          paidForId: usersId[0],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uid(),
          amount: 4128,
          expenseId: expensesIds[2],
          paidForId: usersId[1],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: uid(),
          amount: 4000,
          expenseId: expensesIds[2],
          paidForId: usersId[2],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
    },
  ];

  // TEST
  it('should be defined', () => {
    expect(boardService).toBeDefined();
  });

  it('should calculate correctly the debts of users', () => {
    const debts = boardService.computeDebts(expenses);
    expect(debts).toMatchObject({
      [usersId[0]]: userDebts[0],
      [usersId[1]]: userDebts[1],
      [usersId[2]]: userDebts[2],
    });
  });

  it('should calculate the least transfers between received and gives', () => {
    const userDebtsObj = {
      [usersId[0]]: userDebts[0],
      [usersId[1]]: userDebts[1],
      [usersId[2]]: userDebts[2],
    };

    const transfers = boardService.calculBestTransfers(userDebtsObj);
    expect(transfers).toMatchObject(transfersRes);
  });
});
