import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  Patch,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { SendMessageDto, MarkAsReadDto } from './messages.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async sendMessage(@Request() req, @Body() dto: SendMessageDto) {
    return this.messagesService.sendMessage(req.user.userId, dto);
  }

  @Get('conversation/:conversationId')
  async getConversationMessages(
    @Request() req,
    @Param('conversationId') conversationId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.messagesService.getConversationMessages(
      req.user.userId,
      conversationId,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
    );
  }

  @Patch('mark-read')
  async markAsRead(@Request() req, @Body() dto: MarkAsReadDto) {
    await this.messagesService.markAsRead(req.user.userId, dto);
    return { message: 'Messages marked as read' };
  }

  @Get('unread-count')
  async getUnreadCount(
    @Request() req,
    @Query('conversationId') conversationId?: string,
  ) {
    const count = await this.messagesService.getUnreadCount(req.user.userId, conversationId);
    return { count };
  }

  @Delete(':id')
  async deleteMessage(@Request() req, @Param('id') id: string) {
    await this.messagesService.deleteMessage(req.user.userId, id);
    return { message: 'Message deleted successfully' };
  }
}
