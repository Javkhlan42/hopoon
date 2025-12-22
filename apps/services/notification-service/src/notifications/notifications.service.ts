import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import {
  Notification,
  NotificationType,
  NotificationChannel,
  NotificationStatus,
} from './notification.entity';
import { SendNotificationDto, BulkNotificationDto, MarkAsReadDto } from './notifications.dto';
import { EmailService } from './email.service';
import { SmsService } from './sms.service';
import { PushService } from './push.service';
import { NotificationsGateway } from './notifications.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    private emailService: EmailService,
    private smsService: SmsService,
    private pushService: PushService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async sendNotification(dto: SendNotificationDto): Promise<Notification[]> {
    const notifications: Notification[] = [];

    for (const channel of dto.channels) {
      const notification = this.notificationsRepository.create({
        userId: dto.userId,
        type: dto.type,
        channel,
        title: dto.title,
        message: dto.message,
        data: dto.data,
        status: NotificationStatus.PENDING,
      });

      const saved = await this.notificationsRepository.save(notification);
      notifications.push(saved);

      // Send through appropriate channel
      try {
        switch (channel) {
          case NotificationChannel.EMAIL:
            await this.emailService.sendEmail(dto.userId, dto.title, dto.message);
            break;
          case NotificationChannel.SMS:
            await this.smsService.sendSMS(dto.userId, dto.message);
            break;
          case NotificationChannel.PUSH:
            await this.pushService.sendPushNotification(dto.userId, dto.title, dto.message);
            break;
          case NotificationChannel.IN_APP:
            this.notificationsGateway.sendToUser(dto.userId, {
              id: saved.id,
              type: dto.type,
              title: dto.title,
              message: dto.message,
              data: dto.data,
              createdAt: saved.createdAt,
            });
            break;
        }

        saved.status = NotificationStatus.SENT;
        saved.sentAt = new Date();
        await this.notificationsRepository.save(saved);
      } catch (error) {
        saved.status = NotificationStatus.FAILED;
        saved.failureReason = error.message;
        await this.notificationsRepository.save(saved);
      }
    }

    return notifications;
  }

  async sendBulkNotification(dto: BulkNotificationDto): Promise<void> {
    const promises = dto.userIds.map((userId) =>
      this.sendNotification({
        userId,
        type: dto.type,
        channels: dto.channels,
        title: dto.title,
        message: dto.message,
        data: dto.data,
      }),
    );

    await Promise.all(promises);
  }

  async getUserNotifications(userId: string, unreadOnly: boolean = false): Promise<Notification[]> {
    const where: any = { userId };
    
    if (unreadOnly) {
      where.readAt = null;
    }

    return this.notificationsRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async markAsRead(userId: string, dto: MarkAsReadDto): Promise<void> {
    await this.notificationsRepository.update(
      {
        id: In(dto.notificationIds),
        userId,
      },
      {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    );
  }

  async getNotificationById(userId: string, notificationId: string): Promise<Notification> {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return notification;
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.notificationsRepository.count({
      where: {
        userId,
        readAt: null,
      },
    });
  }
}
