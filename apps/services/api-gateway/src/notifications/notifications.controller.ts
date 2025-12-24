import {
  Controller,
  All,
  Req,
  Res,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ProxyService } from '../proxy/proxy.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly proxyService: ProxyService) {}

  @Public()
  @All()
  @All('*')
  async proxyNotificationService(@Req() req: Request, @Res() res: Response) {
    const serviceUrl =
      process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3007';
    // Don't pass controllerPrefix - Notification Service has 'notifications' prefix,
    // so /api/v1/notifications/* should become /notifications/*
    return this.proxyService.proxy(req, res, serviceUrl);
  }
}
