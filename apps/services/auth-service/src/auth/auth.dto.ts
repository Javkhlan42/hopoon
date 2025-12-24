import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  MinLength,
  Matches,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: '+97699112244', description: 'User phone number' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+?976|8)?[0-9]{8}$/, { message: 'Invalid phone number format' })
  phone: string;

  @ApiProperty({
    example: 'password123',
    description: 'User password (min 8 chars, 1 letter, 1 number)',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
    message:
      'Password must contain at least 8 characters, one letter and one number',
  })
  password: string;

  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'user@example.com',
    description: 'User email',
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({
    enum: ['passenger', 'driver', 'both'],
    example: 'passenger',
    description: 'User role',
  })
  @IsOptional()
  @IsEnum(['passenger', 'driver', 'both'], {
    message:
      'role must be one of the following values: passenger, driver, both',
  })
  role?: 'passenger' | 'driver' | 'both';
}

export class LoginDto {
  @ApiProperty({ example: '+97699112244', description: 'User phone number' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'Refresh token',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@hopon.mn', description: 'Admin email' })
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'admin123', description: 'Admin password' })
  @IsString()
  @IsNotEmpty()
  password: string;
}
