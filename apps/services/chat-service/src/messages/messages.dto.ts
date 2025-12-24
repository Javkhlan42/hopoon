import { IsUUID, IsString, IsEnum, IsOptional, IsObject } from 'class-validator';
import { MessageType } from './message.entity';

export class SendMessageDto {
  @IsUUID()
  conversationId: string;

  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;

  @IsString()
  content: string;

  @IsOptional()
  @IsObject()
  metadata?: any;
}

export class MarkAsReadDto {
  @IsUUID()
  conversationId: string;
}
