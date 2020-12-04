import {
  Controller,
  Get,
  Post,
  HttpStatus,
  UseGuards,
  Put,
  HttpCode,
  Body,
  HttpException,
} from '@nestjs/common';
import { MemberService } from '@/modules/member/member.servies';
import { HttpProcessor } from '@/shared/decorators/http.decorator';
import { JwtAuthGuard } from '@/shared/guard/auth.guard';
import { createMemberByAccount } from './member.dto';
import { HttpError } from '@/shared/errors/custom.error';

@Controller('member')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @HttpProcessor('取得當前會員資料')
  @Get()
  Me(): Promise<any> {
    return this.memberService.getMemberInfo();
  }

  @HttpProcessor('取得當前會員資料')
  @Get('cache')
  cache(): Promise<any> {
    return this.memberService.getMemberInfoCache();
  }

  @HttpProcessor('新增會員')
  @Post()
  @UseGuards(JwtAuthGuard)
  createMember(@Body() param: createMemberByAccount): Promise<any> {
    return this.memberService.createMember();
  }
}
