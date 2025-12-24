import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RidesService } from '../rides/rides.service';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly ridesService: RidesService) {}

  @Get('rides')
  async getRides(@Query() query: any) {
    const { search, status, page = 1, limit = 20 } = query;

    const where: any = {};

    if (search) {
      // Search functionality would need to be implemented in service
    }

    if (status && status !== 'all') {
      where.status = status;
    }

    const rides = await this.ridesService.findAll({
      ...where,
      page,
      limit,
    });

    return {
      rides: rides.data,
      meta: {
        total: rides.total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(rides.total / parseInt(limit)),
      },
    };
  }

  @Get('rides/:id')
  async getRideDetails(@Param('id') id: string) {
    const ride = await this.ridesService.findOne(id);

    return {
      ride,
      passengers: [], // Would come from booking service
      chatHistory: [], // Would come from chat service
    };
  }

  @Post('rides/:id/cancel')
  async cancelRide(@Param('id') id: string, @Body() body: { reason?: string }) {
    // Would need to implement cancel functionality in rides service
    return { success: true, message: 'Ride cancelled' };
  }

  @Delete('rides/:id')
  async deleteRide(@Param('id') id: string) {
    // Soft delete by cancelling the ride
    await this.ridesService.cancel(id, 'admin');
    return { success: true, message: 'Ride deleted (cancelled)' };
  }

  @Get('reports/ride-stats')
  async getRideStats() {
    // Mock implementation
    return {
      completed: 0,
      cancelled: 0,
      ongoing: 0,
      completionRate: 0,
    };
  }

  @Get('reports/popular-routes')
  async getPopularRoutes(@Query('limit') limit = 10) {
    // Mock implementation - would need aggregation
    return [];
  }
}
