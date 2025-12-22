import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { RidesService } from './rides.service';
import { CreateRideDto, UpdateRideDto, SearchRidesDto, RideQueryDto } from './rides.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('rides')
@UseGuards(JwtAuthGuard)
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Post()
  async create(@Body() createRideDto: CreateRideDto, @Request() req) {
    return this.ridesService.create(createRideDto, req.user.userId);
  }

  @Get()
  async findAll(@Query() query: RideQueryDto) {
    return this.ridesService.findAll(query);
  }

  @Get('search')
  async search(@Query() searchDto: SearchRidesDto) {
    return this.ridesService.search(searchDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ridesService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRideDto: UpdateRideDto, @Request() req) {
    return this.ridesService.update(id, updateRideDto, req.user.userId);
  }

  @Delete(':id')
  async cancel(@Param('id') id: string, @Request() req) {
    return this.ridesService.cancel(id, req.user.userId);
  }

  @Patch(':id/start')
  async start(@Param('id') id: string, @Request() req) {
    return this.ridesService.startRide(id, req.user.userId);
  }

  @Patch(':id/complete')
  async complete(@Param('id') id: string, @Request() req) {
    return this.ridesService.completeRide(id, req.user.userId);
  }

  @Patch(':id/seats')
  async updateSeats(@Param('id') id: string, @Body() body: { seatsChange: number }) {
    return this.ridesService.updateAvailableSeats(id, body.seatsChange);
  }
}
