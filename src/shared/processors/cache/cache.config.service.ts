import * as lodash from 'lodash';
import * as APP_CONFIG from '@/app.config';
import * as redisStore from 'cache-manager-redis-store';
import { ClientOpts, RetryStrategyOptions } from 'redis';
import {
  CacheModuleOptions,
  CacheOptionsFactory,
  Injectable,
} from '@nestjs/common';
// import { EmailService } from '@/processors/helper/helper.service.email';

@Injectable()
export class CacheConfigService implements CacheOptionsFactory {
  constructor() {} //private readonly emailService: EmailService) {}

  public retryStrategy(options: RetryStrategyOptions) {
    console.error('Reids 異常！', options.error);
    // this.sendAlarmMail(String(options.error));

    if (options.error && options.error.code === 'ECONNREFUSED') {
      return new Error('Redis server reject！');
    }
    if (options.total_retry_time > 1000 * 60) {
      return new Error('Redis retry time out');
    }
    if (options.attempt > 6) {
      return new Error('Redis limited');
    }

    return Math.min(options.attempt * 100, 3000);
  }

  public createCacheOptions(): CacheModuleOptions {
    const redisOptions: ClientOpts = {
      host: APP_CONFIG.REDIS.host as string,
      port: APP_CONFIG.REDIS.port as number,
      retry_strategy: this.retryStrategy.bind(this),
    };
    return {
      store: redisStore,
      ttl: APP_CONFIG.REDIS.ttl,
      ...redisOptions,
    };
  }
}
