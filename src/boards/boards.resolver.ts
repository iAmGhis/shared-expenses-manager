import { PrismaService } from 'nestjs-prisma';
import {
  Resolver,
  Query,
  Parent,
  Args,
  ResolveField,
  Subscription,
  Mutation,
} from '@nestjs/graphql';
import { findManyCursorConnection } from '@devoxa/prisma-relay-cursor-connection';
import { PubSub } from 'graphql-subscriptions';
import { UseGuards } from '@nestjs/common';
import { PaginationArgs } from 'src/common/pagination/pagination.args';
import { UserEntity } from 'src/common/decorators/user.decorator';
import { User } from 'src/users/models/user.model';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { BoardIdArgs } from './args/board-id.args';
import { UserIdArgs } from './args/user-id.args';
import { Board } from './models/board.model';
import { BoardConnection } from './models/board-connection.model';
import { BoardsOrder } from './dto/board-order.input';
import { CreateBoardInput } from './dto/createBoard.input';

const pubSub = new PubSub();

@Resolver(() => Board)
export class BoardsResolver {
  constructor(private prisma: PrismaService) {}

  @Subscription(() => Board)
  boardCreated() {
    return pubSub.asyncIterator('boardCreated');
  }

  @UseGuards(GqlAuthGuard)
  @Mutation(() => Board)
  async createBoard(
    @UserEntity() user: User,
    @Args('data') data: CreateBoardInput
  ) {
    const newBoard = this.prisma.board.create({
      data: {
        published: true,
        title: data.title,
        authorId: user.id,
      },
    });
    pubSub.publish('boardCreated', { boardCreated: newBoard });
    return newBoard;
  }

  @Query(() => BoardConnection)
  async publishedBoards(
    @Args() { after, before, first, last }: PaginationArgs,
    @Args({ name: 'query', type: () => String, nullable: true })
    query: string,
    @Args({
      name: 'orderBy',
      type: () => BoardsOrder,
      nullable: true,
    })
    orderBy: BoardsOrder
  ) {
    const a = await findManyCursorConnection(
      (args) =>
        this.prisma.board.findMany({
          include: { author: true },
          where: {
            published: true,
            title: { contains: query || '' },
          },
          orderBy: orderBy ? { [orderBy.field]: orderBy.direction } : null,
          ...args,
        }),
      () =>
        this.prisma.board.count({
          where: {
            published: true,
            title: { contains: query || '' },
          },
        }),
      { first, last, before, after }
    );
    return a;
  }

  @Query(() => [Board])
  userBoards(@Args() id: UserIdArgs) {
    return this.prisma.user
      .findUnique({ where: { id: id.userId } })
      .boards({ where: { published: true } });
  }

  @Query(() => Board)
  async board(@Args() id: BoardIdArgs) {
    return this.prisma.board.findUnique({ where: { id: id.boardId } });
  }

  @ResolveField('author', () => User)
  async author(@Parent() board: Board) {
    return this.prisma.board.findUnique({ where: { id: board.id } }).author();
  }
}
