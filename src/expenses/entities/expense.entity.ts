import { Expense } from '@prisma/client';

export class ExpenseEntity implements Expense {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  title: string;
  authorId: string;
  totalAmount: number;
  boardId: string;
  paidById: string;
}
