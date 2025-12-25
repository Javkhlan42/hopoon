import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsDateString,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { RideStatus } from './ride.entity';

export class LocationDto {
  @ApiProperty({ example: 47.9184, description: 'Latitude' })
  @IsNumber()
  @Min(-90)
  @Max(90)
  lat: number;

  @ApiProperty({ example: 106.9177, description: 'Longitude' })
  @IsNumber()
  @Min(-180)
  @Max(180)
  lng: number;

  @ApiProperty({
    example: 'Sukhbaatar Square, Ulaanbaatar',
    description: 'Address',
  })
  @IsString()
  @IsNotEmpty()
  address: string;
}

export class CreateRideDto {
  @ApiProperty({ type: LocationDto, description: 'Starting location' })
  @ValidateNested()
  @Type(() => LocationDto)
  origin: LocationDto;

  @ApiProperty({ type: LocationDto, description: 'Destination location' })
  @ValidateNested()
  @Type(() => LocationDto)
  destination: LocationDto;

  @ApiProperty({
    example: '2024-12-25T10:00:00Z',
    description: 'Departure time (ISO 8601)',
  })
  @IsDateString()
  departureTime: string;

  @ApiProperty({
    example: 3,
    description: 'Number of available seats',
    minimum: 1,
    maximum: 10,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  availableSeats: number;

  @ApiProperty({
    example: 5000,
    description: 'Price per seat in MNT',
    minimum: 0,
  })
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
  @ApiProperty({ example: 47.9184, description: 'Origin latitude' })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  originLat: number;

  @ApiProperty({ example: 106.9177, description: 'Origin longitude' })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  originLng: number;

  @ApiProperty({ example: 49.4871, description: 'Destination latitude' })
  @Type(() => Number)
  @IsNumber()
  @Min(-90)
  @Max(90)
  destinationLat: number;

  @ApiProperty({ example: 105.9057, description: 'Destination longitude' })
  @Type(() => Number)
  @IsNumber()
  @Min(-180)
  @Max(180)
  destinationLng: number;

  @ApiPropertyOptional({ example: '2024-12-25', description: 'Departure date' })
  @IsOptional()
  @IsDateString()
  departureDate?: string;

  @ApiPropertyOptional({ example: 2, description: 'Minimum seats required' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  seats?: number;

  @ApiPropertyOptional({ example: 10, description: 'Search radius in km' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxRadius?: number = 5; // km

  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

export class RideQueryDto {
  @ApiPropertyOptional({
    enum: RideStatus,
    description: 'Filter by ride status',
  })
  @IsOptional()
  @IsEnum(RideStatus)
  status?: RideStatus;

  @ApiPropertyOptional({ description: 'Filter by driver ID' })
  @IsOptional()
  @IsString()
  driverId?: string;

  @ApiPropertyOptional({ example: 1, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Items per page' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
