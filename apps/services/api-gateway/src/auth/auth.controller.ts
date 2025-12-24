import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ProxyService } from '../proxy/proxy.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './public.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  private readonly authServiceUrl: string;

  constructor(private proxyService: ProxyService) {
    this.authServiceUrl =
      process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['phone', 'password', 'name', 'role'],
      properties: {
        phone: {
          type: 'string',
          example: '+97699887766',
          description: 'Phone number in Mongolian format',
        },
        password: {
          type: 'string',
          example: 'password123',
          description: 'Minimum 8 characters, must contain letters and numbers',
        },
        role: {
          type: 'string',
          enum: ['passenger', 'driver', 'both'],
          example: 'passenger',
        },
        name: { type: 'string', example: 'John Doe' },
        email: {
          type: 'string',
          format: 'email',
          example: 'john@example.com',
          description: 'Optional email',
        },
      },
    },
  })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async register(@Body() body: any) {
    return this.proxyService.post(this.authServiceUrl, '/auth/register', body);
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['phone', 'password'],
      properties: {
        phone: {
          type: 'string',
          example: '+97699887766',
          description: 'Registered phone number',
        },
        password: { type: 'string', example: 'password123' },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful, returns JWT token and user data',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body() body: any) {
    return this.proxyService.post(this.authServiceUrl, '/auth/login', body);
  }

  @Public()
  @Post('refresh')
  async refresh(@Body() body: any) {
    return this.proxyService.post(this.authServiceUrl, '/auth/refresh', body);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.post(
      this.authServiceUrl,
      '/auth/logout',
      {},
      { Authorization: token },
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getProfile(@Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(
      this.authServiceUrl,
      '/auth/me',
      {},
      { Authorization: token },
    );
  }
}
