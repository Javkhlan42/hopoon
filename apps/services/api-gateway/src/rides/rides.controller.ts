import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  SetMetadata,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiQuery,
  ApiParam,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { ProxyService } from '../proxy/proxy.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@ApiTags('Rides')
@Controller('rides')
@UseGuards(JwtAuthGuard)
export class RidesController {
  private readonly rideServiceUrl: string;

  constructor(private proxyService: ProxyService) {
    this.rideServiceUrl =
      process.env.RIDE_SERVICE_URL || 'http://localhost:3003';
  }

  @Public()
  @Post()
  @ApiOperation({ summary: 'Create a new ride' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['origin', 'destination', 'departureTime', 'availableSeats', 'pricePerSeat'],
      properties: {
        origin: {
          type: 'object',
          required: ['lat', 'lng', 'address'],
          properties: {
            lat: { type: 'number', example: 47.9184, description: 'Latitude' },
            lng: { type: 'number', example: 106.9177, description: 'Longitude' },
            address: { type: 'string', example: 'Sukhbaatar Square, Ulaanbaatar' },
          },
        },
        destination: {
          type: 'object',
          required: ['lat', 'lng', 'address'],
          properties: {
            lat: { type: 'number', example: 49.5687, description: 'Latitude' },
            lng: { type: 'number', example: 105.9067, description: 'Longitude' },
            address: { type: 'string', example: 'Darkhan City Center' },
          },
        },
        departureTime: {
          type: 'string',
          format: 'date-time',
          example: '2024-12-25T10:00:00Z',
          description: 'Departure time in ISO 8601 format',
        },
        availableSeats: {
          type: 'number',
          minimum: 1,
          maximum: 10,
          example: 3,
          description: 'Number of available seats',
        },
        pricePerSeat: {
          type: 'number',
          minimum: 0,
          example: 5000,
          description: 'Price per seat in MNT',
        },
      },
    },
  })
  async create(@Body() body: any, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.post(this.rideServiceUrl, '/rides', body, {
      Authorization: token,
    });
  }

  @Public()
  @Get()
  @Throttle({ default: { limit: 20, ttl: 60000 } })
  async findAll(@Query() query: any, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(this.rideServiceUrl, '/rides', query, {
      Authorization: token,
    });
  }

  @Public()
  @Get('search')
  @Throttle({ default: { limit: 30, ttl: 60000 } })
  async search(@Query() query: any, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(this.rideServiceUrl, '/rides/search', query, {
      Authorization: token,
    });
  }

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(
      this.rideServiceUrl,
      `/rides/${id}`,
      {},
      { Authorization: token },
    );
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.patch(this.rideServiceUrl, `/rides/${id}`, body, {
      Authorization: token,
    });
  }

  @Delete(':id')
  async cancel(@Param('id') id: string, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.delete(this.rideServiceUrl, `/rides/${id}`, {
      Authorization: token,
    });
  }

  @Public()
  @Get('feed')
  @ApiOperation({ summary: 'Get ride feed' })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  @ApiQuery({ name: 'radius', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFeed(@Query() query: any, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(this.rideServiceUrl, '/rides/feed', query, {
      Authorization: token,
    });
  }

  @Post(':id/comments')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add comment to ride' })
  @ApiParam({ name: 'id', description: 'Ride ID' })
  async addComment(
    @Param('id') id: string,
    @Body() body: any,
    @Req() req: any,
  ) {
    const token = req.headers.authorization;
    return this.proxyService.post(
      this.rideServiceUrl,
      `/rides/${id}/comments`,
      body,
      { Authorization: token },
    );
  }
}
