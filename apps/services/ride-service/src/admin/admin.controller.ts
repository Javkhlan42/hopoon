import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
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

    // Transform rides to match frontend expectations
    const transformedRides = rides.data.map((ride) => ({
      id: ride.id,
      driverId: ride.driver_id,
      driverName: `Driver ${ride.driver_id.substring(0, 8)}`, // Placeholder - would need driver service
      from: ride.origin_address,
      to: ride.destination_address,
      departureTime: ride.departure_time,
      availableSeats: ride.available_seats,
      totalSeats: ride.available_seats, // Would need to track original total separately
      price: parseFloat(ride.price_per_seat.toString()),
      status: ride.status,
      passengers: 0, // Would come from booking service
    }));

    return {
      rides: transformedRides,
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancel a ride' })
  @ApiParam({ name: 'id', description: 'Ride ID' })
  @ApiResponse({ status: 200, description: 'Ride cancelled successfully' })
  async cancelRide(@Param('id') id: string, @Body() body: { reason?: string }) {
    // Would need to implement cancel functionality in rides service
    return { success: true, message: 'Ride cancelled' };
  }

  @Delete('rides/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a ride (soft delete)' })
  @ApiParam({ name: 'id', description: 'Ride ID' })
  @ApiResponse({ status: 200, description: 'Ride deleted successfully' })
  async deleteRide(@Param('id') id: string) {
    // Soft delete by cancelling the ride
    await this.ridesService.cancel(id, 'admin');
    return { success: true, message: 'Ride deleted (cancelled)' };
  }

  @Get('dashboard/stats')
  @ApiOperation({ summary: 'Get ride statistics for dashboard' })
  async getDashboardStats() {
    const totalRides = await this.ridesService.count();
    const activeRides = await this.ridesService.count({ status: 'active' });
    const completedRides = await this.ridesService.count({
      status: 'completed',
    });

    return {
      totalRides,
      activeRides,
      completedRides,
    };
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
