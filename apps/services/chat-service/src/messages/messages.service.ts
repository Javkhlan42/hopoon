import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message, MessageStatus, MessageType } from './message.entity';
import { Conversation } from '../conversations/conversation.entity';
import { SendMessageDto, MarkAsReadDto } from './messages.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
  ) {}

  async sendMessage(userId: string, dto: SendMessageDto): Promise<Message> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id: dto.conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!conversation.participantIds.includes(userId)) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const message = this.messagesRepository.create({
      conversationId: dto.conversationId,
      senderId: userId,
      type: dto.type || MessageType.TEXT,
      content: dto.content,
      metadata: dto.metadata,
      status: MessageStatus.SENT,
      readBy: [userId],
    });

    const savedMessage = await this.messagesRepository.save(message);

    // Update conversation's updatedAt
    conversation.updatedAt = new Date();
    await this.conversationsRepository.save(conversation);

    return savedMessage;
  }

  async getConversationMessages(
    userId: string,
    conversationId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<Message[]> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id: conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!conversation.participantIds.includes(userId)) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    return this.messagesRepository.find({
      where: { conversationId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async markAsRead(userId: string, dto: MarkAsReadDto): Promise<void> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id: dto.conversationId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!conversation.participantIds.includes(userId)) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    const messages = await this.messagesRepository.find({
      where: {
        conversationId: dto.conversationId,
        senderId: Not(userId),
      },
    });

    for (const message of messages) {
      if (!message.readBy) {
        message.readBy = [];
      }

      if (!message.readBy.includes(userId)) {
        message.readBy.push(userId);
        message.status = MessageStatus.READ;
        message.readAt = new Date();
        await this.messagesRepository.save(message);
      }
    }
  }

  async getUnreadCount(userId: string, conversationId?: string): Promise<number> {
    const queryBuilder = this.messagesRepository
      .createQueryBuilder('message')
      .leftJoin('message.conversation', 'conversation')
      .where(':userId = ANY(conversation.participantIds)', { userId })
      .andWhere('message.senderId != :userId', { userId })
      .andWhere('(message.readBy IS NULL OR NOT(:userId = ANY(message.readBy)))', { userId });

    if (conversationId) {
      queryBuilder.andWhere('message.conversationId = :conversationId', { conversationId });
    }

    return queryBuilder.getCount();
  }

  async deleteMessage(userId: string, messageId: string): Promise<void> {
    const message = await this.messagesRepository.findOne({
      where: { id: messageId },
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.senderId !== userId) {
      throw new ForbiddenException('You can only delete your own messages');
    }

    await this.messagesRepository.remove(message);
  }
}

// Import Not operator
import { Not } from 'typeorm';
