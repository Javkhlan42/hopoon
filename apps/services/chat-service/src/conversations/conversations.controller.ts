import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto, AddParticipantDto, RemoveParticipantDto } from './conversations.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  async createConversation(@Request() req, @Body() dto: CreateConversationDto) {
    return this.conversationsService.createConversation(req.user.userId, dto);
  }

  @Get()
  async getUserConversations(@Request() req) {
    return this.conversationsService.getUserConversations(req.user.userId);
  }

  @Get(':id')
  async getConversationById(@Request() req, @Param('id') id: string) {
    return this.conversationsService.getConversationById(req.user.userId, id);
  }

  @Patch(':id/participants')
  async addParticipant(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: AddParticipantDto,
  ) {
    return this.conversationsService.addParticipant(req.user.userId, id, dto);
  }

  @Delete(':id/participants')
  async removeParticipant(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: RemoveParticipantDto,
  ) {
    return this.conversationsService.removeParticipant(req.user.userId, id, dto);
  }

  @Delete(':id')
  async deleteConversation(@Request() req, @Param('id') id: string) {
    await this.conversationsService.deleteConversation(req.user.userId, id);
    return { message: 'Conversation deleted successfully' };
  }
}
