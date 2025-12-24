import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  MinLength,
  Matches,
  IsEnum,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^(\+?976|8)?[0-9]{8}$/, { message: 'Invalid phone number format' })
  phone: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/, {
    message:
      'Password must contain at least 8 characters, one letter and one number',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(['passenger', 'driver', 'both'], {
    message:
      'role must be one of the following values: passenger, driver, both',
  })
  role?: 'passenger' | 'driver' | 'both';
}

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
