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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminService } from './admin.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Dashboard
  @Get('dashboard/stats')
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
  async getUsers(@Query() query: any) {
    return this.adminService.getUsers(query);
  }

  @Get('users/:id')
  async getUserDetails(@Param('id') id: string) {
    return this.adminService.getUserDetails(id);
  }

  @Post('users/:id/block')
  async blockUser(@Param('id') id: string, @Body() body: { reason?: string }) {
    return this.adminService.blockUser(id, body.reason);
  }

  @Post('users/:id/unblock')
  async unblockUser(@Param('id') id: string) {
    return this.adminService.unblockUser(id);
  }

  @Delete('users/:id')
  async deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id);
  }

  @Post('users/:id/verify')
  async verifyUser(@Param('id') id: string) {
    return this.adminService.toggleVerification(id);
  }

  // SOS
  @Get('sos')
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
  async getUserGrowth(@Query('period') period?: string) {
    return this.adminService.getUserGrowth(period || 'month');
  }

  @Get('reports/top-drivers')
  async getTopDrivers(@Query('limit') limit?: number) {
    return this.adminService.getTopDrivers(limit || 10);
  }

  @Get('reports/revenue')
  async getRevenue(@Query('period') period?: string) {
    return this.adminService.getRevenue(period || 'month');
  }

  // System
  @Get('system/status')
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
