import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { TopUpWalletDto } from '../payments/payments.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Get('balance')
  async getBalance(@Request() req) {
    return this.walletService.getBalance(req.user.userId);
  }

  @Post('topup')
  async topUpWallet(@Request() req, @Body() dto: TopUpWalletDto) {
    return this.walletService.topUpWallet(req.user.userId, dto);
  }
}
