import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { NotificationsController } from './notifications/notifications.controller';
import { NotificationsService } from './notifications/notifications.service';
import { EmailService } from './notifications/email.service';
import { SmsService } from './notifications/sms.service';
import { PushService } from './notifications/push.service';
import { NotificationsGateway } from './notifications/notifications.gateway';
import { Notification } from './notifications/notification.entity';
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
      entities: [Notification],
      synchronize: false,
      ssl: process.env.DB_HOST?.includes('neon.tech')
        ? { rejectUnauthorized: false }
        : false,
    }),
    TypeOrmModule.forFeature([Notification]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'hopon-secret-key',
    }),
  ],
  controllers: [NotificationsController],
  providers: [
    NotificationsService,
    EmailService,
    SmsService,
    PushService,
    NotificationsGateway,
    JwtStrategy,
  ],
})
export class AppModule {}
