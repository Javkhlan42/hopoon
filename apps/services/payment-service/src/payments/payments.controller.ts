import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Request,
  SetMetadata,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ProcessRidePaymentDto, RefundPaymentDto } from './payments.dto';
import { JwtAuthGuard, IS_PUBLIC_KEY } from '../auth/jwt-auth.guard';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Public()
  @Post('ride')
  @HttpCode(HttpStatus.OK)
  async processRidePayment(
    @Request() req,
    @Body() dto: ProcessRidePaymentDto & { userId?: string },
  ) {
    const userId = dto.userId || req.user?.userId;
    return this.paymentsService.processRidePayment(userId, dto);
  }

  @Public()
  @Post('refund')
  @HttpCode(HttpStatus.OK)
  async refundPayment(
    @Request() req,
    @Body() dto: RefundPaymentDto & { userId?: string },
  ) {
    const userId = dto.userId || req.user?.userId;
    return this.paymentsService.refundPayment(userId, dto);
  }

  @Public()
  @Get('history')
  async getPaymentHistory(@Request() req) {
    const userId = req.query?.userId || req.user?.userId;
    return this.paymentsService.getPaymentHistory(userId);
  }

  @Public()
  @Get(':id')
  async getPaymentById(@Request() req, @Param('id') id: string) {
    const userId = req.query?.userId || req.user?.userId;
    return this.paymentsService.getPaymentById(userId, id);
  }
}
