import { Module } from '@nestjs/common';
import { AppController } from '@/app.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { HttpCacheInterceptor } from '@/shared/interceptors/cache.interceptor';

// modules
import { MemberModule } from '@/modules/member/member.module';
import { CacheModule } from '@/shared/processors/cache/cache.module';

@Module({
  imports: [MemberModule, CacheModule],
  controllers: [AppController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpCacheInterceptor,
    },
  ],
})
export class AppModule {}
