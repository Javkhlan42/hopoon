import { Controller, Post, Body, SetMetadata } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProxyService } from '../proxy/proxy.service';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@ApiTags('Admin Auth')
@Controller('auth/admin')
export class AdminAuthController {
  private readonly authServiceUrl: string;

  constructor(private proxyService: ProxyService) {
    this.authServiceUrl =
      process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
  }

  @Public()
  @Post('login')
  @ApiOperation({ summary: 'Admin login' })
  async login(@Body() body: { email: string; password: string }) {
    return this.proxyService.post(
      this.authServiceUrl,
      '/auth/admin/login',
      body,
    );
  }
}
