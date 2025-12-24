import { IsUUID, IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ConversationType } from './conversation.entity';

export class CreateConversationDto {
  @IsEnum(ConversationType)
  @IsOptional()
  type?: ConversationType;

  @IsString()
  @IsOptional()
  title?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  participantIds: string[];

  @IsUUID()
  @IsOptional()
  bookingId?: string;

  @IsUUID()
  @IsOptional()
  rideId?: string;
}

export class AddParticipantDto {
  @IsUUID()
  userId: string;
}

export class RemoveParticipantDto {
  @IsUUID()
  userId: string;
}
