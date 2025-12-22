import { Controller, Post, Get, Body, Req, UseGuards } from '@nestjs/common';
import { ProxyService } from '../proxy/proxy.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { Public } from './public.decorator';

@Controller('auth')
export class AuthController {
  private readonly authServiceUrl: string;

  constructor(private proxyService: ProxyService) {
    this.authServiceUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
  }

  @Public()
  @Post('register')
  async register(@Body() body: any) {
    return this.proxyService.post(this.authServiceUrl, '/auth/register', body);
  }

  @Public()
  @Post('login')
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
