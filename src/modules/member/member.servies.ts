import { Injectable, HttpStatus } from '@nestjs/common';
import { HttpError } from '@/shared/errors/custom.error';
import {
  CacheService,
  TCacheIntervalResult,
} from '@/shared/processors/cache/cache.service';
import * as CACHE_KEY from '@/shared/constants/cache.constant';
@Injectable()
export class MemberService {
  private cacheData: TCacheIntervalResult<any>;
  constructor(private readonly cacheService: CacheService) {
    this.cacheData = this.cacheService.interval({
      timeout: {
        success: 1000 * 60 * 30, // 成功後 30分鐘更新一次
        error: 1000 * 60 * 5, // 失敗後 5分鐘更新一次
      },
      key: CACHE_KEY.HOT_ARTICLES,
      promise: () => {
        return this.getMemberInfo.bind(this)();
      },
    });
  }

  public async getMemberInfo(): Promise<any> {
    return await { name: 'york', age: '50' };
  }

  public getMemberInfoCache(): Promise<any> {
    return this.cacheData();
  }

  public createMember(): any {
    throw new HttpError({ message: 'sdf' }, HttpStatus.FORBIDDEN);
    return { name: 'york', age: '29' };
  }
}
