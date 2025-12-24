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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiResponse,
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
  @ApiResponse({ status: 201, description: 'Ride created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
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
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update ride details' })
  @ApiParam({ name: 'id', description: 'Ride ID' })
  @ApiBody({ type: UpdateRideDto })
  @ApiResponse({ status: 200, description: 'Ride updated successfully' })
  async update(
    @Param('id') id: string,
    @Body() updateRideDto: UpdateRideDto,
    @Request() req,
  ) {
    return this.ridesService.update(id, updateRideDto, req.user.userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Cancel a ride' })
  @ApiParam({ name: 'id', description: 'Ride ID' })
  @ApiResponse({ status: 200, description: 'Ride cancelled successfully' })
  async cancel(@Param('id') id: string, @Request() req) {
    return this.ridesService.cancel(id, req.user.userId);
  }

  @Patch(':id/start')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Start a ride' })
  @ApiParam({ name: 'id', description: 'Ride ID' })
  @ApiResponse({ status: 200, description: 'Ride started successfully' })
  async start(@Param('id') id: string, @Request() req) {
    return this.ridesService.startRide(id, req.user.userId);
  }

  @Patch(':id/complete')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Complete a ride' })
  @ApiParam({ name: 'id', description: 'Ride ID' })
  @ApiResponse({ status: 200, description: 'Ride completed successfully' })
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

  @Public()
  @Get('feed')
  @ApiOperation({ summary: 'Get ride feed' })
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  @ApiQuery({ name: 'radius', required: false, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getFeed(@Query() query: Record<string, unknown>) {
    return this.ridesService.getFeed(query);
  }

  @Post(':id/comments')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add comment to ride' })
  @ApiParam({ name: 'id', description: 'Ride ID' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        text: { type: 'string' },
      },
    },
  })
  @HttpCode(HttpStatus.CREATED)
  async addComment(
    @Param('id') id: string,
    @Body() body: { text: string },
    @Request() req,
  ) {
    return this.ridesService.addComment(id, req.user.userId, body.text);
  }
}
