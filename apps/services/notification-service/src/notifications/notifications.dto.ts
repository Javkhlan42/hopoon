import { IsUUID, IsEnum, IsString, IsOptional, IsObject, IsArray } from 'class-validator';
import { NotificationType, NotificationChannel } from './notification.entity';

export class SendNotificationDto {
  @IsUUID()
  userId: string;

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels: NotificationChannel[];

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  data?: any;
}

export class BulkNotificationDto {
  @IsArray()
  @IsUUID('4', { each: true })
  userIds: string[];

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsArray()
  @IsEnum(NotificationChannel, { each: true })
  channels: NotificationChannel[];

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  data?: any;
}

export class MarkAsReadDto {
  @IsArray()
  @IsUUID('4', { each: true })
  notificationIds: string[];
}
