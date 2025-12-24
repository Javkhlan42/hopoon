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
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ProxyService } from '../proxy/proxy.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  private readonly bookingServiceUrl: string;

  constructor(private proxyService: ProxyService) {
    this.bookingServiceUrl =
      process.env.BOOKING_SERVICE_URL || 'http://localhost:3004';
  }

  @Post()
  async create(@Body() body: any, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.post(this.bookingServiceUrl, '/bookings', body, {
      Authorization: token,
    });
  }

  @Get()
  async findAll(@Query() query: any, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(this.bookingServiceUrl, '/bookings', query, {
      Authorization: token,
    });
  }

  @Get('driver')
  async getDriverBookings(@Query() query: any, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(
      this.bookingServiceUrl,
      '/bookings/driver',
      query,
      { Authorization: token },
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.get(
      this.bookingServiceUrl,
      `/bookings/${id}`,
      {},
      { Authorization: token },
    );
  }

  @Patch(':id/approve')
  async approve(@Param('id') id: string, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.patch(
      this.bookingServiceUrl,
      `/bookings/${id}/approve`,
      {},
      { Authorization: token },
    );
  }

  @Patch(':id/reject')
  async reject(@Param('id') id: string, @Body() body: any, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.patch(
      this.bookingServiceUrl,
      `/bookings/${id}/reject`,
      body,
      { Authorization: token },
    );
  }

  @Delete(':id')
  async cancel(@Param('id') id: string, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.delete(this.bookingServiceUrl, `/bookings/${id}`, {
      Authorization: token,
    });
  }

  @Patch(':id/complete')
  async complete(@Param('id') id: string, @Req() req: any) {
    const token = req.headers.authorization;
    return this.proxyService.patch(
      this.bookingServiceUrl,
      `/bookings/${id}/complete`,
      {},
      { Authorization: token },
    );
  }
}
