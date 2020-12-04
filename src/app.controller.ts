import { Controller, Get, HttpStatus, HttpException } from '@nestjs/common';
import * as APP_CONFIG from '@/app.config';
import { HttpProcessor } from '@/shared/decorators/http.decorator';

@Controller()
export class AppController {
  @Get()
  @HttpProcessor({
    description: 'nestjs api 模板',
    version: APP_CONFIG.INFO.version,
    copyright: APP_CONFIG.INFO.author,
  })
  root(): any {}
}
