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
import { ProxyService } from '../proxy/proxy.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

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
}
