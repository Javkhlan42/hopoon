import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsUUID,
  IsEnum,
  IsOptional,
} from 'class-validator';
import { BookingStatus } from './booking.entity';

export class CreateBookingDto {
  @IsString()
  @IsNotEmpty()
  rideId: string;

  @IsInt()
  @Min(1)
  @Max(10)
  seats: number;
}

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  status: BookingStatus;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class BookingQueryDto {
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @IsOptional()
  @IsUUID()
  rideId?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
