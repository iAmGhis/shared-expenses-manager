import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  UseGuards,
  Put,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
} from '@nestjs/swagger';
import { BoardsService } from './boards.service';
import { AddParticipantsDto } from './dto/add-participants.dto';
import { CreateBoardDto } from './dto/create-board.dto';
import { UpdateBoardDto } from './dto/update-board.dto';
import { BoardEntity } from './entities/board.entity';

@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('boards')
export class BoardsController {
  constructor(private readonly boardsService: BoardsService) {}

  @Post()
  @ApiCreatedResponse({ type: BoardEntity })
  create(@Req() req, @Body() createBoardDto: CreateBoardDto) {
    return this.boardsService.create(createBoardDto, req.user.id);
  }

  @Get()
  @ApiOkResponse({ type: [BoardEntity] })
  findUserBoards(@Req() req) {
    return this.boardsService.findUserBoards(req.user.id);
  }

  @Get(':id')
  @ApiOkResponse({ type: BoardEntity })
  findOne(@Req() req, @Param('id') id: string) {
    return this.boardsService.findOne(id, req.user.id);
  }

  @Get(':id/debts')
  computeDebts(@Param('id') id: string) {
    return this.boardsService.computeDebts(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: BoardEntity })
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() updateBoardDto: UpdateBoardDto
  ) {
    return this.boardsService.update(id, updateBoardDto, req.user.id);
  }

  @Put(':id/participants')
  @ApiOkResponse({ type: BoardEntity })
  addParticipants(@Param('id') id: string, @Body() body: AddParticipantsDto) {
    return this.boardsService.addParticipants(id, body.users);
  }

  @Delete(':id')
  @ApiOkResponse()
  remove(@Req() req, @Param('id') id: string) {
    return this.boardsService.remove(id, req.user.id);
  }
}
