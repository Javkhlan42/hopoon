import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ProxyService } from '../proxy/proxy.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@ApiTags('Admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  private readonly authServiceUrl: string;
  private readonly rideServiceUrl: string;
  private readonly bookingServiceUrl: string;
  private readonly userServiceUrl: string;

  constructor(private proxyService: ProxyService) {
    this.authServiceUrl =
      process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    this.rideServiceUrl =
      process.env.RIDE_SERVICE_URL || 'http://localhost:3003';
    this.bookingServiceUrl =
      process.env.BOOKING_SERVICE_URL || 'http://localhost:3004';
    this.userServiceUrl =
      process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
  }

  // ============================================
  // DASHBOARD
  // ============================================

  @Public()
  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats(@Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(
      this.authServiceUrl,
      '/admin/dashboard/stats',
      {},
      { Authorization: token },
    );
  }

  @Get('dashboard/daily-stats')
  @ApiOperation({ summary: 'Get daily statistics' })
  async getDailyStats(@Query() query: any, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(
      this.authServiceUrl,
      '/admin/dashboard/daily-stats',
      query,
      { Authorization: token },
    );
  }

  @Get('dashboard/active-sos')
  @ApiOperation({ summary: 'Get active SOS alerts' })
  async getActiveSOS(@Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(
      this.authServiceUrl,
      '/admin/dashboard/active-sos',
      {},
      { Authorization: token },
    );
  }

  // ============================================
  // USERS
  // ============================================

  @Get('users')
  @ApiOperation({ summary: 'Get users list' })
  async getUsers(@Query() query: any, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(
      this.userServiceUrl,
      '/admin/users',
      query,
      { Authorization: token },
    );
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details' })
  async getUserDetails(@Param('id') id: string, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(
      this.userServiceUrl,
      `/admin/users/${id}`,
      {},
      { Authorization: token },
    );
  }

  @Post('users/:id/block')
  @ApiOperation({ summary: 'Block user' })
  async blockUser(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @Req() req: any,
  ) {
    const token = req.headers.authorization;
    return this.proxyService.post(
      this.userServiceUrl,
      `/admin/users/${id}/block`,
      body,
      { Authorization: token },
    );
  }

  @Post('users/:id/unblock')
  @ApiOperation({ summary: 'Unblock user' })
  async unblockUser(@Param('id') id: string, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.post(
      this.userServiceUrl,
      `/admin/users/${id}/unblock`,
      {},
      { Authorization: token },
    );
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Delete user' })
  async deleteUser(@Param('id') id: string, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.delete(
      this.userServiceUrl,
      `/admin/users/${id}`,
      { Authorization: token },
    );
  }

  @Post('users/:id/verify')
  @ApiOperation({ summary: 'Toggle user verification' })
  async verifyUser(@Param('id') id: string, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.post(
      this.userServiceUrl,
      `/admin/users/${id}/verify`,
      {},
      { Authorization: token },
    );
  }

  // ============================================
  // RIDES
  // ============================================

  @Get('rides')
  @ApiOperation({ summary: 'Get rides list' })
  async getRides(@Query() query: any, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(
      this.rideServiceUrl,
      '/admin/rides',
      query,
      { Authorization: token },
    );
  }

  @Get('rides/:id')
  @ApiOperation({ summary: 'Get ride details' })
  async getRideDetails(@Param('id') id: string, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(
      this.rideServiceUrl,
      `/admin/rides/${id}`,
      {},
      { Authorization: token },
    );
  }

  @Post('rides/:id/cancel')
  @ApiOperation({ summary: 'Cancel ride' })
  async cancelRide(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @Req() req: any,
  ) {
    const token = req.headers.authorization;
    return this.proxyService.post(
      this.rideServiceUrl,
      `/admin/rides/${id}/cancel`,
      body,
      { Authorization: token },
    );
  }

  @Delete('rides/:id')
  @ApiOperation({ summary: 'Delete ride' })
  async deleteRide(@Param('id') id: string, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.delete(
      this.rideServiceUrl,
      `/admin/rides/${id}`,
      { Authorization: token },
    );
  }

  // ============================================
  // SOS
  // ============================================

  @Get('sos')
  @ApiOperation({ summary: 'Get SOS alerts' })
  async getSOSAlerts(@Query() query: any, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(
      this.authServiceUrl,
      '/admin/sos',
      query,
      { Authorization: token },
    );
  }

  @Post('sos/:id/resolve')
  @ApiOperation({ summary: 'Resolve SOS alert' })
  async resolveAlert(
    @Param('id') id: string,
    @Body() body: { notes?: string },
    @Req() req: any,
  ) {
    const token = req.headers.authorization;
    return this.proxyService.post(
      this.authServiceUrl,
      `/admin/sos/${id}/resolve`,
      body,
      { Authorization: token },
    );
  }

  @Post('sos/:id/call')
  @ApiOperation({ summary: 'Initiate call to user' })
  async callUser(@Param('id') id: string, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.post(
      this.authServiceUrl,
      `/admin/sos/${id}/call`,
      {},
      { Authorization: token },
    );
  }

  @Get('sos/:id/navigation')
  @ApiOperation({ summary: 'Get navigation link' })
  async getNavigation(@Param('id') id: string, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(
      this.authServiceUrl,
      `/admin/sos/${id}/navigation`,
      {},
      { Authorization: token },
    );
  }

  // ============================================
  // MODERATION
  // ============================================

  @Get('moderation/reports')
  @ApiOperation({ summary: 'Get reports list' })
  async getReports(@Query() query: any, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(
      this.authServiceUrl,
      '/admin/moderation/reports',
      query,
      { Authorization: token },
    );
  }

  @Get('moderation/reports/:id')
  @ApiOperation({ summary: 'Get report details' })
  async getReportDetails(@Param('id') id: string, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(
      this.authServiceUrl,
      `/admin/moderation/reports/${id}`,
      {},
      { Authorization: token },
    );
  }

  @Post('moderation/reports/:id/approve')
  @ApiOperation({ summary: 'Approve report' })
  async approveReport(
    @Param('id') id: string,
    @Body() body: { action?: string; notes?: string },
    @Req() req: any,
  ) {
    const token = req.headers.authorization;
    return this.proxyService.post(
      this.authServiceUrl,
      `/admin/moderation/reports/${id}/approve`,
      body,
      { Authorization: token },
    );
  }

  @Post('moderation/reports/:id/reject')
  @ApiOperation({ summary: 'Reject report' })
  async rejectReport(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @Req() req: any,
  ) {
    const token = req.headers.authorization;
    return this.proxyService.post(
      this.authServiceUrl,
      `/admin/moderation/reports/${id}/reject`,
      body,
      { Authorization: token },
    );
  }

  // ============================================
  // REPORTS
  // ============================================

  @Get('reports/user-growth')
  @ApiOperation({ summary: 'Get user growth report' })
  async getUserGrowth(@Query() query: any, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(
      this.authServiceUrl,
      '/admin/reports/user-growth',
      query,
      { Authorization: token },
    );
  }

  @Get('reports/ride-stats')
  @ApiOperation({ summary: 'Get ride statistics' })
  async getRideStats(@Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(
      this.rideServiceUrl,
      '/admin/reports/ride-stats',
      {},
      { Authorization: token },
    );
  }

  @Get('reports/revenue')
  @ApiOperation({ summary: 'Get revenue report' })
  async getRevenue(@Query() query: any, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(
      this.authServiceUrl,
      '/admin/reports/revenue',
      query,
      { Authorization: token },
    );
  }

  @Get('reports/popular-routes')
  @ApiOperation({ summary: 'Get popular routes' })
  async getPopularRoutes(@Query() query: any, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(
      this.rideServiceUrl,
      '/admin/reports/popular-routes',
      query,
      { Authorization: token },
    );
  }

  @Get('reports/top-drivers')
  @ApiOperation({ summary: 'Get top drivers' })
  async getTopDrivers(@Query() query: any, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(
      this.authServiceUrl,
      '/admin/reports/top-drivers',
      query,
      { Authorization: token },
    );
  }

  // ============================================
  // SYSTEM
  // ============================================

  @Get('system/status')
  @ApiOperation({ summary: 'Get system status' })
  async getSystemStatus(@Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(
      this.authServiceUrl,
      '/admin/system/status',
      {},
      { Authorization: token },
    );
  }

  @Get('system/services')
  @ApiOperation({ summary: 'Get services health' })
  async getServicesHealth(@Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(
      this.authServiceUrl,
      '/admin/system/services',
      {},
      { Authorization: token },
    );
  }

  @Get('system/logs')
  @ApiOperation({ summary: 'Get system logs' })
  async getLogs(@Query() query: any, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(
      this.authServiceUrl,
      '/admin/system/logs',
      query,
      { Authorization: token },
    );
  }

  @Put('system/config')
  @ApiOperation({ summary: 'Update system configuration' })
  async updateConfig(@Body() body: any, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.put(
      this.authServiceUrl,
      '/admin/system/config',
      body,
      { Authorization: token },
    );
  }
}
