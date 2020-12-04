import * as schedule from 'node-schedule';
import { RedisClient } from 'redis';
import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';

export interface ICacheManager {
  store: {
    getClient(): RedisClient;
  };
  get(key: TCacheKey): any;
  set(key: TCacheKey, value: string, options?: { ttl: number }): any;
}

export type TCacheKey = string;
export type TCacheResult<T> = Promise<T>;

export interface ICacheIoResult<T> {
  get(): TCacheResult<T>;
  update(): TCacheResult<T>;
}

export interface ICachePromiseOption<T> {
  key: TCacheKey;
  promise(): TCacheResult<T>;
}

export interface ICachePromiseIoOption<T> extends ICachePromiseOption<T> {
  ioMode?: boolean;
}

export interface ICacheIntervalTimeoutOption {
  error?: number;
  success?: number;
}

export interface ICacheIntervalTimingOption {
  error: number;
  schedule: any;
}

export interface ICacheIntervalOption<T> {
  key: TCacheKey;
  promise(): TCacheResult<T>;
  timeout?: ICacheIntervalTimeoutOption;
  timing?: ICacheIntervalTimingOption;
}

export type TCacheIntervalResult<T> = () => TCacheResult<T>;

export interface ICacheIntervalIOOption<T> extends ICacheIntervalOption<T> {
  ioMode?: boolean;
}

@Injectable()
export class CacheService {
  private cache!: ICacheManager;

  constructor(@Inject(CACHE_MANAGER) cache: ICacheManager) {
    this.cache = cache;
    this.redisClient.on('ready', () => {
      console.info('Reids is ready');
    });
  }

  private get redisClient(): RedisClient {
    return this.cache.store.getClient();
  }

  private get checkCacheServiceAvailable(): boolean {
    return this.redisClient.connected;
  }

  public get<T>(key: TCacheKey): TCacheResult<T> {
    if (!this.checkCacheServiceAvailable) {
      return Promise.reject('cache service is not ready');
    }
    return this.cache.get(key);
  }

  public set<T>(
    key: TCacheKey,
    value: any,
    options?: { ttl: number },
  ): TCacheResult<T> {
    if (!this.checkCacheServiceAvailable) {
      return Promise.reject('cache service is not ready');
    }
    return this.cache.set(key, value, options);
  }

  promise<T>(options: ICachePromiseOption<T>): TCacheResult<T>;
  promise<T>(options: ICachePromiseIoOption<T>): ICacheIoResult<T>;
  promise(options) {
    const { key, promise, ioMode = false } = options;

    const promiseTask = (resolve, reject) => {
      return promise()
        .then(data => {
          this.set(key, data);
          resolve(data);
        })
        .catch(reject);
    };

    const handlePromiseMode = () => {
      return new Promise((resolve, reject) => {
        this.get(key)
          .then(value => {
            value !== null && value !== undefined
              ? resolve(value)
              : promiseTask(resolve, reject);
          })
          .catch(reject);
      });
    };

    const handleIoMode = () => ({
      get: handlePromiseMode,
      update: () => new Promise(promiseTask),
    });

    return ioMode ? handleIoMode() : handlePromiseMode();
  }

  public interval<T>(options: ICacheIntervalOption<T>): TCacheIntervalResult<T>;
  public interval<T>(options: ICacheIntervalIOOption<T>): ICacheIoResult<T>;
  public interval<T>(options) {
    const { key, promise, timeout, timing, ioMode = false } = options;

    const promiseTask = (): Promise<T> => {
      return promise().then(data => {
        this.set(key, data);
        return data;
      });
    };

    if (timeout) {
      const doPromise = () => {
        promiseTask()
          .then(_ => {
            setTimeout(doPromise, timeout.success);
          })
          .catch(error => {
            const time = timeout.error || timeout.success;
            setTimeout(doPromise, time);
            console.warn(`Redis overtime task failed ${time}s retry：${error}`);
          });
      };
      doPromise();
    }

    if (timing) {
      const doPromise = () => {
        promiseTask()
          .then(data => data)
          .catch(error => {
            console.warn(`Redis  task failed${timing.error}s retry: ${error}`);
            setTimeout(doPromise, timing.error);
          });
      };
      doPromise();
      schedule.scheduleJob(timing.schedule, doPromise);
    }

    const getKeyCache = () => this.get(key);

    const handleIoMode = () => ({
      get: getKeyCache,
      update: promiseTask,
    });

    return ioMode ? handleIoMode() : getKeyCache;
  }
}
