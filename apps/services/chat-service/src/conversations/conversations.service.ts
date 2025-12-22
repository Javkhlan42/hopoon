import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Conversation, ConversationType } from './conversation.entity';
import { CreateConversationDto, AddParticipantDto, RemoveParticipantDto } from './conversations.dto';

@Injectable()
export class ConversationsService {
  constructor(
    @InjectRepository(Conversation)
    private conversationsRepository: Repository<Conversation>,
  ) {}

  async createConversation(userId: string, dto: CreateConversationDto): Promise<Conversation> {
    // Ensure current user is included in participants
    const participantIds = [...new Set([userId, ...dto.participantIds])];

    // For direct conversations, ensure exactly 2 participants
    if (dto.type === ConversationType.DIRECT && participantIds.length !== 2) {
      throw new BadRequestException('Direct conversations must have exactly 2 participants');
    }

    // Check if direct conversation already exists
    if (dto.type === ConversationType.DIRECT || participantIds.length === 2) {
      const existing = await this.conversationsRepository
        .createQueryBuilder('conversation')
        .where('conversation.type = :type', { type: ConversationType.DIRECT })
        .andWhere('conversation.participantIds @> ARRAY[:...ids]::uuid[]', { ids: participantIds })
        .andWhere('array_length(conversation.participantIds, 1) = :length', { length: participantIds.length })
        .getOne();

      if (existing) {
        return existing;
      }
    }

    const conversation = this.conversationsRepository.create({
      type: dto.type || (participantIds.length === 2 ? ConversationType.DIRECT : ConversationType.GROUP),
      title: dto.title,
      participantIds,
      bookingId: dto.bookingId,
      rideId: dto.rideId,
    });

    return this.conversationsRepository.save(conversation);
  }

  async getUserConversations(userId: string): Promise<Conversation[]> {
    return this.conversationsRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.messages', 'message')
      .where(':userId = ANY(conversation.participantIds)', { userId })
      .andWhere('conversation.isActive = :isActive', { isActive: true })
      .orderBy('conversation.updatedAt', 'DESC')
      .getMany();
  }

  async getConversationById(userId: string, conversationId: string): Promise<Conversation> {
    const conversation = await this.conversationsRepository.findOne({
      where: { id: conversationId },
      relations: ['messages'],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    if (!conversation.participantIds.includes(userId)) {
      throw new ForbiddenException('You are not a participant in this conversation');
    }

    return conversation;
  }

  async addParticipant(userId: string, conversationId: string, dto: AddParticipantDto): Promise<Conversation> {
    const conversation = await this.getConversationById(userId, conversationId);

    if (conversation.type === ConversationType.DIRECT) {
      throw new BadRequestException('Cannot add participants to direct conversations');
    }

    if (conversation.participantIds.includes(dto.userId)) {
      throw new BadRequestException('User is already a participant');
    }

    conversation.participantIds.push(dto.userId);
    return this.conversationsRepository.save(conversation);
  }

  async removeParticipant(userId: string, conversationId: string, dto: RemoveParticipantDto): Promise<Conversation> {
    const conversation = await this.getConversationById(userId, conversationId);

    if (conversation.type === ConversationType.DIRECT) {
      throw new BadRequestException('Cannot remove participants from direct conversations');
    }

    const index = conversation.participantIds.indexOf(dto.userId);
    if (index === -1) {
      throw new BadRequestException('User is not a participant');
    }

    conversation.participantIds.splice(index, 1);

    if (conversation.participantIds.length < 2) {
      conversation.isActive = false;
    }

    return this.conversationsRepository.save(conversation);
  }

  async deleteConversation(userId: string, conversationId: string): Promise<void> {
    const conversation = await this.getConversationById(userId, conversationId);
    
    conversation.isActive = false;
    await this.conversationsRepository.save(conversation);
  }

  async getOrCreateDirectConversation(userId: string, otherUserId: string): Promise<Conversation> {
    const participantIds = [userId, otherUserId].sort();

    const existing = await this.conversationsRepository
      .createQueryBuilder('conversation')
      .where('conversation.type = :type', { type: ConversationType.DIRECT })
      .andWhere('conversation.participantIds @> ARRAY[:...ids]::uuid[]', { ids: participantIds })
      .andWhere('array_length(conversation.participantIds, 1) = 2')
      .getOne();

    if (existing) {
      return existing;
    }

    return this.createConversation(userId, {
      type: ConversationType.DIRECT,
      participantIds: [otherUserId],
    });
  }
}
