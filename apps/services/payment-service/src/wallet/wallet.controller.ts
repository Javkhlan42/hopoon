import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
  SetMetadata,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { WalletService } from './wallet.service';
import { TopUpWalletDto } from '../payments/payments.dto';
import { JwtAuthGuard, IS_PUBLIC_KEY } from '../auth/jwt-auth.guard';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Public()
  @Get('balance')
  async getBalance(@Request() req) {
    const userId = req.query?.userId || req.user?.userId;
    return this.walletService.getBalance(userId);
  }

  @Public()
  @Post('topup')
  @HttpCode(HttpStatus.OK)
  async topUpWallet(
    @Request() req,
    @Body() dto: TopUpWalletDto & { userId?: string },
  ) {
    const userId = dto.userId || req.user?.userId;
    const result = await this.walletService.topUpWallet(userId, dto);
    return {
      balance: result.wallet.balance,
      transactionId: result.payment.transactionId,
      status: result.payment.status,
    };
  }
}
