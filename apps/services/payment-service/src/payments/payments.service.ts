import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Payment,
  PaymentStatus,
  PaymentType,
  PaymentMethod,
} from './payment.entity';
import { Wallet } from '../wallet/wallet.entity';
import {
  CreatePaymentDto,
  ProcessRidePaymentDto,
  RefundPaymentDto,
} from './payments.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private paymentsRepository: Repository<Payment>,
    @InjectRepository(Wallet)
    private walletsRepository: Repository<Wallet>,
    private dataSource: DataSource,
  ) {}

  async processRidePayment(
    userId: string,
    dto: ProcessRidePaymentDto,
  ): Promise<Payment> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Mock booking service call to get ride amount
      const bookingAmount = 15000; // ₮15,000 (mock value)

      const payment = queryRunner.manager.create(Payment, {
        userId,
        bookingId: dto.bookingId,
        amount: bookingAmount,
        type: PaymentType.RIDE,
        method: dto.method,
        status: PaymentStatus.PROCESSING,
      });

      if (dto.method === PaymentMethod.WALLET) {
        const wallet = await queryRunner.manager.findOne(Wallet, {
          where: { userId },
        });

        if (!wallet) {
          throw new BadRequestException('Wallet not found');
        }

        const currentBalance = parseFloat(wallet.balance.toString());
        const requiredAmount = parseFloat(bookingAmount.toString());

        if (currentBalance < requiredAmount) {
          throw new BadRequestException(
            `Insufficient wallet balance. Current: ${currentBalance}, Required: ${requiredAmount}`,
          );
        }

        wallet.balance = currentBalance - requiredAmount;
        await queryRunner.manager.save(wallet);
        payment.status = PaymentStatus.COMPLETED;
      } else if (dto.method === PaymentMethod.CARD) {
        // Mock card payment processing
        const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        payment.transactionId = transactionId;
        payment.status = PaymentStatus.COMPLETED;
      } else if (dto.method === PaymentMethod.CASH) {
        payment.status = PaymentStatus.PENDING;
      }

      const savedPayment = await queryRunner.manager.save(payment);
      await queryRunner.commitTransaction();

      return savedPayment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async refundPayment(userId: string, dto: RefundPaymentDto): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id: dto.paymentId, userId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== PaymentStatus.COMPLETED) {
      throw new BadRequestException('Only completed payments can be refunded');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const refundPayment = queryRunner.manager.create(Payment, {
        userId,
        bookingId: payment.bookingId,
        amount: payment.amount,
        type: PaymentType.REFUND,
        method: payment.method,
        status: PaymentStatus.COMPLETED,
        description: dto.reason || 'Refund',
        metadata: { originalPaymentId: payment.id },
      });

      if (payment.method === PaymentMethod.WALLET) {
        const wallet = await queryRunner.manager.findOne(Wallet, {
          where: { userId },
        });

        if (wallet) {
          const currentBalance = parseFloat(wallet.balance.toString());
          const refundAmount = parseFloat(payment.amount.toString());
          wallet.balance = currentBalance + refundAmount;
          await queryRunner.manager.save(wallet);
        }
      }

      payment.status = PaymentStatus.REFUNDED;
      await queryRunner.manager.save(payment);

      const savedRefund = await queryRunner.manager.save(refundPayment);
      await queryRunner.commitTransaction();

      return savedRefund;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getPaymentHistory(userId: string): Promise<Payment[]> {
    return this.paymentsRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async getPaymentById(userId: string, paymentId: string): Promise<Payment> {
    const payment = await this.paymentsRepository.findOne({
      where: { id: paymentId, userId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }
}
