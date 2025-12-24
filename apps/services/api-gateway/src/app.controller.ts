import { Controller, Get } from '@nestjs/common';
import { Public } from './auth/public.decorator';

@Controller()
export class AppController {
  @Public()
  @Get()
  getRoot() {
    return {
      success: true,
      message: 'Hop-On API Gateway',
      version: '1.0.0',
      endpoints: {
        auth: '/api/v1/auth',
        rides: '/api/v1/rides',
        bookings: '/api/v1/bookings',
      },
      timestamp: new Date().toISOString(),
    };
  }

  @Public()
  @Get('health')
  getHealth() {
    return {
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
