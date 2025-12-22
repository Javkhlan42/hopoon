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
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { SendNotificationDto, BulkNotificationDto, MarkAsReadDto } from './notifications.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async sendNotification(@Body() dto: SendNotificationDto) {
    return this.notificationsService.sendNotification(dto);
  }

  @Post('bulk')
  async sendBulkNotification(@Body() dto: BulkNotificationDto) {
    await this.notificationsService.sendBulkNotification(dto);
    return { message: 'Bulk notifications sent successfully' };
  }

  @Get()
  async getUserNotifications(
    @Request() req,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    const unread = unreadOnly === 'true';
    return this.notificationsService.getUserNotifications(req.user.userId, unread);
  }

  @Get('unread-count')
  async getUnreadCount(@Request() req) {
    const count = await this.notificationsService.getUnreadCount(req.user.userId);
    return { count };
  }

  @Get(':id')
  async getNotificationById(@Request() req, @Param('id') id: string) {
    return this.notificationsService.getNotificationById(req.user.userId, id);
  }

  @Patch('mark-read')
  async markAsRead(@Request() req, @Body() dto: MarkAsReadDto) {
    await this.notificationsService.markAsRead(req.user.userId, dto);
    return { message: 'Notifications marked as read' };
  }
}
