import { Module } from '@nestjs/common';
import { MemberController } from './member.controller';
import { MemberService } from './member.servies';

@Module({
  controllers: [MemberController],
  providers: [MemberService],
  exports: [MemberService],
})
export class MemberModule {}
