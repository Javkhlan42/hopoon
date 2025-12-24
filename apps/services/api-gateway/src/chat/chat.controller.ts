import { Controller, All, Req, Res, SetMetadata } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { ProxyService } from '../proxy/proxy.service';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly proxyService: ProxyService) {}

  @Public()
  @All('*')
  async proxyChatService(@Req() req: Request, @Res() res: Response) {
    const serviceUrl = process.env.CHAT_SERVICE_URL || 'http://localhost:3006';
    return this.proxyService.proxy(req, res, serviceUrl, 'chat');
  }
}
