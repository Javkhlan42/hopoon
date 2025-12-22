import { IsUUID, IsNumber, IsEnum, IsOptional, IsString, Min } from 'class-validator';
import { PaymentType, PaymentMethod } from './payment.entity';

export class CreatePaymentDto {
  @IsUUID()
  bookingId: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @IsOptional()
  @IsString()
  description?: string;
}

export class ProcessRidePaymentDto {
  @IsUUID()
  bookingId: string;

  @IsEnum(PaymentMethod)
  method: PaymentMethod;
}

export class RefundPaymentDto {
  @IsUUID()
  paymentId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class TopUpWalletDto {
  @IsNumber()
  @Min(1000)
  amount: number;

  @IsEnum(PaymentMethod)
  @IsOptional()
  paymentMethod?: PaymentMethod;
}
