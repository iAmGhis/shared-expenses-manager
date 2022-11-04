import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';

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

  findOne(id: string) {
    return this.prisma.board.findFirst({
      where: {
        id,
      },
    });
  }

  update(id: string, updateBoardDto: UpdateBoardDto) {
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

  remove(id: string) {
    return this.prisma.board.delete({
      where: {
        id,
      },
    });
  }
}
