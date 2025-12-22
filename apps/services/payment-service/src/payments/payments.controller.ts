import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ProcessRidePaymentDto, RefundPaymentDto } from './payments.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('payments')
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('ride')
  async processRidePayment(@Request() req, @Body() dto: ProcessRidePaymentDto) {
    return this.paymentsService.processRidePayment(req.user.userId, dto);
  }

  @Post('refund')
  async refundPayment(@Request() req, @Body() dto: RefundPaymentDto) {
    return this.paymentsService.refundPayment(req.user.userId, dto);
  }

  @Get('history')
  async getPaymentHistory(@Request() req) {
    return this.paymentsService.getPaymentHistory(req.user.userId);
  }

  @Get(':id')
  async getPaymentById(@Request() req, @Param('id') id: string) {
    return this.paymentsService.getPaymentById(req.user.userId, id);
  }
}
