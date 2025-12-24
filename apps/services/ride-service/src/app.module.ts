import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RidesController } from './rides/rides.controller';
import { RidesService } from './rides/rides.service';
import { Ride } from './rides/ride.entity';
import { JwtStrategy } from './auth/jwt.strategy';
import { AdminController } from './admin/admin.controller';
import { AdminGuard } from './admin/admin.guard';

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
      entities: [Ride],
      synchronize: false,
      ssl: process.env.DB_HOST?.includes('neon.tech')
        ? { rejectUnauthorized: false }
        : false,
    }),
    TypeOrmModule.forFeature([Ride]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'hopon-secret-key',
    }),
  ],
  controllers: [RidesController, AdminController],
  providers: [RidesService, JwtStrategy, AdminGuard],
})
export class AppModule {}
