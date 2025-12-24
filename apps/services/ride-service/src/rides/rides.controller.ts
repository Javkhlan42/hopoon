import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  SetMetadata,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { RidesService } from './rides.service';
import {
  CreateRideDto,
  UpdateRideDto,
  SearchRidesDto,
  RideQueryDto,
} from './rides.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@ApiTags('Rides')
@Controller('rides')
@UseGuards(JwtAuthGuard)
export class RidesController {
  constructor(private readonly ridesService: RidesService) {}

  @Post()
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a new ride' })
  @ApiBody({ type: CreateRideDto })
  async create(@Body() createRideDto: CreateRideDto, @Request() req) {
    return this.ridesService.create(createRideDto, req.user.userId);
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all rides with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['active', 'completed', 'cancelled'],
  })
  async findAll(@Query() query: RideQueryDto) {
    return this.ridesService.findAll(query);
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search rides by location and date' })
  async search(@Query() searchDto: SearchRidesDto) {
    return this.ridesService.search(searchDto);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get ride by ID' })
  @ApiParam({ name: 'id', description: 'Ride ID' })
  async findOne(@Param('id') id: string) {
    return this.ridesService.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update ride details' })
  @ApiParam({ name: 'id', description: 'Ride ID' })
  @ApiBody({ type: UpdateRideDto })
  async update(
    @Param('id') id: string,
    @Body() updateRideDto: UpdateRideDto,
    @Request() req,
  ) {
    return this.ridesService.update(id, updateRideDto, req.user.userId);
  }

  @Delete(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel a ride' })
  @ApiParam({ name: 'id', description: 'Ride ID' })
  async cancel(@Param('id') id: string, @Request() req) {
    return this.ridesService.cancel(id, req.user.userId);
  }

  @Patch(':id/start')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Start a ride' })
  @ApiParam({ name: 'id', description: 'Ride ID' })
  async start(@Param('id') id: string, @Request() req) {
    return this.ridesService.startRide(id, req.user.userId);
  }

  @Patch(':id/complete')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Complete a ride' })
  @ApiParam({ name: 'id', description: 'Ride ID' })
  async complete(@Param('id') id: string, @Request() req) {
    return this.ridesService.completeRide(id, req.user.userId);
  }

  @Patch(':id/seats')
  async updateSeats(
    @Param('id') id: string,
    @Body() body: { seatsChange: number },
  ) {
    return this.ridesService.updateAvailableSeats(id, body.seatsChange);
  }
}
