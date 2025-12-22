import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PaymentsController } from './payments/payments.controller';
import { WalletController } from './wallet/wallet.controller';
import { PaymentsService } from './payments/payments.service';
import { WalletService } from './wallet/wallet.service';
import { Payment } from './payments/payment.entity';
import { Wallet } from './wallet/wallet.entity';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'hopon',
      entities: [Payment, Wallet],
      synchronize: false,
      ssl: process.env.DB_HOST?.includes('neon.tech')
        ? { rejectUnauthorized: false }
        : false,
    }),
    TypeOrmModule.forFeature([Payment, Wallet]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'hopon-secret-key',
    }),
  ],
  controllers: [PaymentsController, WalletController],
  providers: [PaymentsService, WalletService, JwtStrategy],
})
export class AppModule {}
