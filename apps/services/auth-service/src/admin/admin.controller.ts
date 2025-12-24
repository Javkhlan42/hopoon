import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { AdminService } from './admin.service';

@ApiTags('Admin - Users')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Dashboard
  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  @Get('dashboard/daily-stats')
  async getDailyStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.adminService.getDailyStats(startDate, endDate);
  }

  @Get('dashboard/active-sos')
  async getActiveSOS() {
    return this.adminService.getActiveSOS();
  }

  // Users
  @Get('users')
  @ApiOperation({ summary: 'Get users list with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({
    name: 'role',
    required: false,
    enum: ['passenger', 'driver', 'both', 'admin'],
  })
  async getUsers(@Query() query: any) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Get user details by ID' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async getUserDetails(@Param('id') id: string) {
    return this.adminService.getUserDetails(id);
  }

  @Post('users/:id/block')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Block a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User blocked successfully' })
  async blockUser(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.adminService.blockUser(id, body.reason);
  }

  @Post('users/:id/unblock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Unblock a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User unblocked successfully' })
  async unblockUser(@Param('id') id: string) {
    return this.adminService.unblockUser(id);
  }

  @Delete('users/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Post('users/:id/verify')
  async verifyUser(@Param('id') id: string) {
    return this.adminService.toggleVerification(id);
  }

  // SOS
  @Get('sos')
  @ApiOperation({ summary: 'Get SOS alerts' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'resolved'] })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getSOSAlerts(@Query() query: any) {
    return this.adminService.getSOSAlerts(query);
  }

  @Post('sos/:id/resolve')
  async resolveAlert(
    @Param('id') id: string,
    @Body() body: { notes?: string },
  ) {
    return this.adminService.resolveAlert(id, body.notes);
  }

  @Post('sos/:id/call')
  async callUser(@Param('id') id: string) {
    return this.adminService.initiateCall(id);
  }

  @Get('sos/:id/navigation')
  async getNavigation(@Param('id') id: string) {
    return this.adminService.getNavigationLink(id);
  }

  // Moderation
  @Get('moderation/reports')
  @ApiOperation({ summary: 'Get moderation reports' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getReports(@Query() query: any) {
    return this.adminService.getReports(query);
  }

  @Get('moderation/reports/:id')
  async getReportDetails(@Param('id') id: string) {
    return this.adminService.getReportDetails(id);
  }

  @Post('moderation/reports/:id/approve')
  async approveReport(
    @Param('id') id: string,
    @Body() body: { action?: string; notes?: string },
  ) {
    return this.adminService.approveReport(id, body.action, body.notes);
  }

  @Post('moderation/reports/:id/reject')
  async rejectReport(
    @Param('id') id: string,
    @Body() body: { reason?: string },
  ) {
    return this.adminService.rejectReport(id, body.reason);
  }

  // Reports
  @Get('reports/user-growth')
  @ApiOperation({ summary: 'Get user growth statistics' })
  @ApiQuery({
    name: 'period',
    required: false,
    enum: ['week', 'month', 'year'],
  })
  async getUserGrowth(@Query('period') period?: string) {
    return this.adminService.getUserGrowth(period || 'month');
  }

  @Get('reports/top-drivers')
  @ApiOperation({ summary: 'Get top drivers by rating' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getTopDrivers(@Query('limit') limit?: number) {
    return this.adminService.getTopDrivers(limit || 10);
  }

  @Get('reports/revenue')
  async getRevenue(@Query('period') period?: string) {
    return this.adminService.getRevenue(period || 'month');
  }

  // System
  @Get('system/status')
  @ApiOperation({ summary: 'Get system status and health' })
  async getSystemStatus() {
    return this.adminService.getSystemStatus();
  }

  @Get('system/services')
  async getServicesHealth() {
    return this.adminService.getServicesHealth();
  }

  @Get('system/logs')
  async getLogs(@Query() query: any) {
    return this.adminService.getLogs(query);
  }
}
