import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Body,
  Req,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { ProxyService } from '../proxy/proxy.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  private readonly authServiceUrl: string;

  constructor(private proxyService: ProxyService) {
    this.authServiceUrl =
      process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Req() req: Request) {
    const token = (req as unknown as { headers: { authorization: string } })
      .headers.authorization;
    return this.proxyService.get(
      this.authServiceUrl,
      '/users/me',
      {},
      { Authorization: token },
    );
  }

  @Patch('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update current user profile' })
  async updateProfile(
    @Req() req: Request,
    @Body() body: Record<string, unknown>,
  ) {
    const token = (req as unknown as { headers: { authorization: string } })
      .headers.authorization;
    return this.proxyService.patch(this.authServiceUrl, '/users/me', body, {
      Authorization: token,
    });
  }

  @Post('me/photo')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload profile photo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPhoto(@Req() req: Request, @UploadedFile() file: unknown) {
    const token = (req as unknown as { headers: { authorization: string } })
      .headers.authorization;
    // Forward multipart data to auth service
    return this.proxyService.post(
      this.authServiceUrl,
      '/users/me/photo',
      { photo: file },
      { Authorization: token },
    );
  }

  @Post('me/verify-identity')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit identity verification' })
  @ApiConsumes('multipart/form-data')
  @HttpCode(HttpStatus.ACCEPTED)
  @UseInterceptors(FileInterceptor('idPhoto'))
  async verifyIdentity(@Req() req: Request, @UploadedFile() file: unknown) {
    const token = (req as unknown as { headers: { authorization: string } })
      .headers.authorization;
    return this.proxyService.post(
      this.authServiceUrl,
      '/users/me/verify-identity',
      { idPhoto: file },
      { Authorization: token },
    );
  }

  @Get('me/rides')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user ride history' })
  async getRideHistory(
    @Req() req: Request,
    @Query() query: Record<string, unknown>,
  ) {
    const token = (req as unknown as { headers: { authorization: string } })
      .headers.authorization;
    return this.proxyService.get(
      this.authServiceUrl,
      '/users/me/rides',
      query,
      { Authorization: token },
    );
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get public user profile' })
  async getUserProfile(@Req() req: Request, @Param('id') id: string) {
    const token = (req as unknown as { headers: { authorization: string } })
      .headers.authorization;
    return this.proxyService.get(
      this.authServiceUrl,
      `/users/${id}`,
      {},
      { Authorization: token },
    );
  }

  @Get(':id/reviews')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user reviews' })
  async getUserReviews(
    @Req() req: Request,
    @Param('id') id: string,
    @Query() query: Record<string, unknown>,
  ) {
    const token = (req as unknown as { headers: { authorization: string } })
      .headers.authorization;
    return this.proxyService.get(
      this.authServiceUrl,
      `/users/${id}/reviews`,
      query,
      { Authorization: token },
    );
  }
}
