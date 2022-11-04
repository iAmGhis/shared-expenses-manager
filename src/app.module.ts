import { GraphQLModule } from '@nestjs/graphql';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from 'nestjs-prisma';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppResolver } from './app.resolver';
import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';
// import { BoardsModule } from 'src/boards/boards.module';
import config from 'src/common/configs/config';
import { loggingMiddleware } from 'src/common/middleware/logging.middleware';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GqlConfigService } from './gql-config.service';
import { ExpensesModule } from './expenses/expenses.module';
import { AdminModule } from '@adminjs/nestjs';

import * as AdminJSPrisma from '@adminjs/prisma';
import AdminJS from 'adminjs';
import { PrismaService } from 'nestjs-prisma';
import { prisma } from '@prisma/client';
import { DMMFClass } from '@prisma/client/runtime';
import { BoardsModule } from './boards/boards.module';

AdminJS.registerAdapter({
  Resource: AdminJSPrisma.Resource,
  Database: AdminJSPrisma.Database,
});

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [loggingMiddleware(new Logger('PrismaMiddleware'))], // configure your prisma middleware
      },
    }),

    // GraphQLModule.forRootAsync<ApolloDriverConfig>({
    //   driver: ApolloDriver,
    //   useClass: GqlConfigService,
    // }),

    AdminModule.createAdminAsync({
      useFactory: () => {
        // Note: Feel free to contribute to this documentation if you find a Nest-way of
        // injecting PrismaService into AdminJS module
        const prisma = new PrismaService();
        // `_baseDmmf` contains necessary Model metadata but it is a private method
        // so it isn't included in PrismaClient type
        const dmmf = (prisma as any)._baseDmmf as DMMFClass;
        return {
          adminJsOptions: {
            rootPath: '/admin',
            resources: [
              {
                resource: { model: dmmf.modelMap.User, client: prisma },
                options: {},
              },
              {
                resource: { model: dmmf.modelMap.Board, client: prisma },
                options: {},
              },
              {
                resource: { model: dmmf.modelMap.Expense, client: prisma },
                options: {},
              },
              {
                resource: {
                  model: dmmf.modelMap.ExpenseDetails,
                  client: prisma,
                },
                options: {},
              },
            ],
          },
        };
      },
    }),

    AuthModule,
    UsersModule,
    // BoardsModule,
    ExpensesModule,
    BoardsModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppResolver],
})
export class AppModule {}
