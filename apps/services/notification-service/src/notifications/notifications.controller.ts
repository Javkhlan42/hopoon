import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  SetMetadata,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  SendNotificationDto,
  BulkNotificationDto,
  MarkAsReadDto,
} from './notifications.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Public()
  @Post()
  async sendNotification(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendNotification(dto);
  }

  @Public()
  @Post('bulk')
  async sendBulkNotification(@Body() dto: BulkNotificationDto) {
    await this.notificationsService.sendBulkNotification(dto);
    return { message: 'Bulk notifications sent successfully' };
  }

  @Public()
  @Get()
  async getUserNotifications(
    @Query('userId') userId: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const unread = unreadOnly === 'true';
    return this.notificationsService.getUserNotifications(userId, unread);
  }

  @Public()
  @Get('unread-count')
  async getUnreadCount(@Query('userId') userId: string) {
    const count = await this.notificationsService.getUnreadCount(userId);
    return { count };
  }

  @Public()
  @Get(':id')
  async getNotificationById(
    @Query('userId') userId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.getNotificationById(userId, id);
  }

  @Public()
  @Patch('mark-read')
  async markAsRead(@Body() dto: MarkAsReadDto & { userId: string }) {
    await this.notificationsService.markAsRead(dto.userId, dto);
    return { message: 'Notifications marked as read' };
  }
}
