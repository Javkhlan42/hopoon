import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Wallet } from './wallet.entity';
import { Payment, PaymentStatus, PaymentType, PaymentMethod } from '../payments/payment.entity';
import { TopUpWalletDto } from '../payments/payments.dto';

@Injectable()
export class WalletService {
  constructor(
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    private dataSource: DataSource,
  ) {}

  async getOrCreateWallet(userId: string): Promise<Wallet> {
    let wallet = await this.walletsRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      wallet = this.walletsRepository.create({
        userId,
        balance: 0,
        frozenBalance: 0,
        currency: 'MNT',
      });
      wallet = await this.walletsRepository.save(wallet);
    }

    return wallet;
  }

  async topUpWallet(userId: string, dto: TopUpWalletDto): Promise<{ wallet: Wallet; payment: Payment }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let wallet = await queryRunner.manager.findOne(Wallet, {
        where: { userId },
      });

      if (!wallet) {
        wallet = queryRunner.manager.create(Wallet, {
          userId,
          balance: 0,
          frozenBalance: 0,
          currency: 'MNT',
        });
      }

      // Create payment record for top-up
      const payment = queryRunner.manager.create(Payment, {
        userId,
        amount: dto.amount,
        type: PaymentType.WALLET_TOPUP,
        method: dto.paymentMethod || PaymentMethod.CARD,
        status: PaymentStatus.PROCESSING,
        description: 'Wallet top-up',
      });

      // Mock payment processing
      const transactionId = `TOPUP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      payment.transactionId = transactionId;
      payment.status = PaymentStatus.COMPLETED;

      wallet.balance += dto.amount;

      const savedWallet = await queryRunner.manager.save(wallet);
      const savedPayment = await queryRunner.manager.save(payment);

      await queryRunner.commitTransaction();

      return {
        wallet: savedWallet,
        payment: savedPayment,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getBalance(userId: string): Promise<Wallet> {
    const wallet = await this.getOrCreateWallet(userId);
    return wallet;
  }

  async freezeAmount(userId: string, amount: number): Promise<Wallet> {
    const wallet = await this.walletsRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient balance');
    }

    wallet.balance -= amount;
    wallet.frozenBalance += amount;

    return this.walletsRepository.save(wallet);
  }

  async unfreezeAmount(userId: string, amount: number): Promise<Wallet> {
    const wallet = await this.walletsRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (wallet.frozenBalance < amount) {
      throw new BadRequestException('Insufficient frozen balance');
    }

    wallet.frozenBalance -= amount;
    wallet.balance += amount;

    return this.walletsRepository.save(wallet);
  }
}
