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
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AdminGuard } from './admin.guard';
import { RidesService } from '../rides/rides.service';

@ApiTags('Admin - Rides')
@ApiBearerAuth('JWT-auth')
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminController {
  constructor(private readonly ridesService: RidesService) {}

  @Get('rides')
  @ApiOperation({ summary: 'Get all rides with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'completed', 'cancelled'],
  })
  @ApiQuery({ name: 'search', required: false, type: String })
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
  @ApiOperation({ summary: 'Get ride details by ID' })
  @ApiParam({ name: 'id', description: 'Ride ID' })
  async getRideDetails(@Param('id') id: string) {
    const ride = await this.ridesService.findOne(id);

    return {
      ride,
      passengers: [], // Would come from booking service
      chatHistory: [], // Would come from chat service
    };
  }

  @Post('rides/:id/cancel')
  @ApiOperation({ summary: 'Cancel a ride' })
  @ApiParam({ name: 'id', description: 'Ride ID' })
  async cancelRide(@Param('id') id: string, @Body() body: { reason?: string }) {
    // Would need to implement cancel functionality in rides service
    return { success: true, message: 'Ride cancelled' };
  }

  @Delete('rides/:id')
  @ApiOperation({ summary: 'Delete a ride (soft delete)' })
  @ApiParam({ name: 'id', description: 'Ride ID' })
  async deleteRide(@Param('id') id: string) {
    // Soft delete by cancelling the ride
    await this.ridesService.cancel(id, 'admin');
    return { success: true, message: 'Ride deleted (cancelled)' };
  }

  @Get('reports/ride-stats')
  @ApiOperation({ summary: 'Get ride statistics' })
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
  @ApiOperation({ summary: 'Get popular routes' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getPopularRoutes(@Query('limit') limit = 10) {
    // Mock implementation - would need aggregation
    return [];
  }
}
