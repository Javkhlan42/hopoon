import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { HttpModule } from '@nestjs/axios';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AuthController } from './auth/auth.controller';
import { RidesController } from './rides/rides.controller';
import { BookingsController } from './bookings/bookings.controller';
import { PaymentsController } from './payments/payments.controller';
import { ChatController } from './chat/chat.controller';
import { NotificationsController } from './notifications/notifications.controller';
import { ProxyService } from './proxy/proxy.service';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    HttpModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'hopon-secret-key',
    }),
    ThrottlerModule.forRoot([
      {
        ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10) * 1000,
        limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
      },
    ]),
  ],
  controllers: [
    AppController,
    AuthController,
    RidesController,
    BookingsController,
    PaymentsController,
    ChatController,
    NotificationsController,
  ],
  providers: [
    ProxyService,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
