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

@Controller('payments')
export class PaymentsController {
  constructor(private readonly proxyService: ProxyService) {}

  @Public()
  @All('*')
  async proxyToPaymentService(@Req() req: Request, @Res() res: Response) {
    const serviceUrl =
      process.env.PAYMENT_SERVICE_URL || 'http://localhost:3005';
    return this.proxyService.proxy(req, res, serviceUrl, 'payments');
  }
}
