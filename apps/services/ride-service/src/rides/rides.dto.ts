import { IsNotEmpty, IsNumber, IsString, IsDateString, IsInt, Min, Max, IsOptional, IsEnum, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RideStatus } from './ride.entity';

export class LocationDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @IsString()
  @IsNotEmpty()
  address: string;
}

export class CreateRideDto {
  @ValidateNested()
  @Type(() => LocationDto)
  origin: LocationDto;

  @ValidateNested()
  @Type(() => LocationDto)
  destination: LocationDto;

  @IsDateString()
  departureTime: string;

  @IsInt()
  @Min(1)
  @Max(10)
  availableSeats: number;

  @IsNumber()
  @Min(0)
  pricePerSeat: number;
}

export class UpdateRideDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  origin?: LocationDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => LocationDto)
  destination?: LocationDto;

  @IsOptional()
  @IsDateString()
  departureTime?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(10)
  availableSeats?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  pricePerSeat?: number;

  @IsOptional()
  @IsEnum(RideStatus)
  status?: RideStatus;
}

export class SearchRidesDto {
  @IsNumber()
  @Min(-90)
  @Max(90)
  originLat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  originLng: number;

  @IsNumber()
  @Min(-90)
  @Max(90)
  destinationLat: number;

  @IsNumber()
  @Min(-180)
  @Max(180)
  destinationLng: number;

  @IsOptional()
  @IsDateString()
  departureDate?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  seats?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  maxRadius?: number = 5; // km

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

export class RideQueryDto {
  @IsOptional()
  @IsEnum(RideStatus)
  status?: RideStatus;

  @IsOptional()
  @IsString()
  driverId?: string;

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
