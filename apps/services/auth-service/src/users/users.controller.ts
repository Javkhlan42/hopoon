import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get current user profile' })
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.userId);
  }

  @Patch('me')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        email: { type: 'string' },
        bio: { type: 'string' },
      },
    },
  })
  async updateProfile(
    @Request() req,
    @Body() updateDto: Record<string, unknown>,
  ) {
    return this.usersService.updateProfile(req.user.userId, updateDto);
  }

  @Post('me/photo')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Upload profile photo' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        photo: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('photo'))
  async uploadPhoto(
    @Request() req,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @UploadedFile() file: any,
  ) {
    return this.usersService.uploadProfilePhoto(req.user.userId, file);
  }

  @Post('me/verify-identity')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit identity verification' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        idPhoto: { type: 'string', format: 'binary' },
        selfiePhoto: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('idPhoto'))
  @HttpCode(HttpStatus.ACCEPTED)
  async verifyIdentity(
    @Request() req,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    @UploadedFile() idPhoto: any,
  ) {
    return this.usersService.submitIdentityVerification(
      req.user.userId,
      idPhoto,
    );
  }

  @Get('me/rides')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user ride history' })
  @ApiQuery({ name: 'role', required: false, enum: ['driver', 'passenger'] })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getRideHistory(
    @Request() req,
    @Query() query: Record<string, unknown>,
  ) {
    return this.usersService.getRideHistory(req.user.userId, query);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get public user profile' })
  @ApiParam({ name: 'id', description: 'User ID' })
  async getUserProfile(@Param('id') id: string) {
    return this.usersService.getPublicProfile(id);
  }

  @Get(':id/reviews')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Get user reviews' })
  @ApiParam({ name: 'id', description: 'User ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getUserReviews(
    @Param('id') id: string,
    @Query() query: Record<string, unknown>,
  ) {
    return this.usersService.getUserReviews(id, query);
  }
}
