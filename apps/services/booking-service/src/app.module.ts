import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { HttpModule } from '@nestjs/axios';
import { BookingsController } from './bookings/bookings.controller';
import { BookingsService } from './bookings/bookings.service';
import { Booking } from './bookings/booking.entity';
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
      entities: [Booking],
      synchronize: false,
      ssl: process.env.DB_HOST?.includes('neon.tech')
        ? { rejectUnauthorized: false }
        : false,
    }),
    TypeOrmModule.forFeature([Booking]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'hopon-secret-key',
    }),
    HttpModule,
  ],
  controllers: [BookingsController],
  providers: [BookingsService, JwtStrategy],
})
export class AppModule {}
