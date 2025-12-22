import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { RidesController } from './rides/rides.controller';
import { RidesService } from './rides/rides.service';
import { Ride } from './rides/ride.entity';
import { JwtStrategy } from './auth/jwt.strategy';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'hopon',
      entities: [Ride],
      synchronize: false,
    }),
    TypeOrmModule.forFeature([Ride]),
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'hopon-secret-key',
    }),
  ],
  controllers: [RidesController],
  providers: [RidesService, JwtStrategy],
})
export class AppModule {}
