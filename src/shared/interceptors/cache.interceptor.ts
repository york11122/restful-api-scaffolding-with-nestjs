import { tap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { Reflector } from '@nestjs/core';
import {
  HttpAdapterHost,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Injectable,
  RequestMethod,
} from '@nestjs/common';
import { CacheService } from '@/shared/processors/cache/cache.service';
import * as SYSYTEM from '@/shared/constants/system.constant';
import * as META from '@/shared/constants/meta.constant';
import * as APP_CONFIG from '@/app.config';

@Injectable()
export class HttpCacheInterceptor implements NestInterceptor {
  constructor(
    private readonly cacheManager: CacheService,
    @Inject(SYSYTEM.REFLECTOR) private readonly reflector: Reflector,
    @Inject(SYSYTEM.HTTP_ADAPTER_HOST)
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Promise<Observable<any>> {
    const call$ = next.handle();
    const key = this.trackBy(context);

    if (!key) {
      return call$;
    }

    const target = context.getHandler();
    const metaTTL = this.reflector.get(META.HTTP_CACHE_TTL_METADATA, target);
    const ttl = metaTTL || APP_CONFIG.REDIS.defaultCacheTTL;

    try {
      const value = await this.cacheManager.get(key);
      return value
        ? of(value)
        : call$.pipe(
            tap(response => this.cacheManager.set(key, response, { ttl })),
          );
    } catch (error) {
      return call$;
    }
  }

  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest();
    const httpServer = this.httpAdapterHost.httpAdapter;
    const isHttpApp = httpServer && !!httpServer.getRequestMethod;
    const isGetRequest =
      isHttpApp &&
      httpServer.getRequestMethod(request) === RequestMethod[RequestMethod.GET];
    const requestUrl = httpServer.getRequestUrl(request);
    const cacheKey = this.reflector.get(
      META.HTTP_CACHE_KEY_METADATA,
      context.getHandler(),
    );
    const isMatchedCache = isHttpApp && isGetRequest && cacheKey;
    return isMatchedCache ? cacheKey : undefined;
  }
}
