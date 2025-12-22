import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto, BookingQueryDto, UpdateBookingStatusDto } from './bookings.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(@Body() createBookingDto: CreateBookingDto, @Request() req) {
    return this.bookingsService.create(createBookingDto, req.user.userId);
  }

  @Get()
  async findAll(@Query() query: BookingQueryDto, @Request() req) {
    return this.bookingsService.findAll(query, req.user.userId);
  }

  @Get('driver')
  async getDriverBookings(@Query() query: BookingQueryDto, @Request() req) {
    return this.bookingsService.getDriverBookings(req.user.userId, query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req) {
    return this.bookingsService.findOne(id, req.user.userId);
  }

  @Patch(':id/approve')
  async approve(@Param('id') id: string, @Request() req) {
    return this.bookingsService.approve(id, req.user.userId);
  }

  @Patch(':id/reject')
  async reject(
    @Param('id') id: string,
    @Body() body: { reason?: string },
    @Request() req,
  ) {
    return this.bookingsService.reject(id, req.user.userId, body.reason);
  }

  @Delete(':id')
  async cancel(@Param('id') id: string, @Request() req) {
    return this.bookingsService.cancel(id, req.user.userId);
  }

  @Patch(':id/complete')
  async complete(@Param('id') id: string) {
    return this.bookingsService.complete(id);
  }
}
