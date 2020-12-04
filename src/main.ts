import * as helmet from 'helmet';
import * as bodyParser from 'body-parser';
import * as rateLimit from 'express-rate-limit';
import * as compression from 'compression';
import * as cluster from 'cluster';
import * as APP_CONFIG from '@/app.config';
import * as fs from 'fs';
import { environment, isProdMode, isDevMode } from '@/app.environment';
import { TransformInterceptor } from '@/shared/interceptors/transform.interceptor';
import { HttpExceptionFilter } from '@/shared/filters/error.filter';
import { ValidationPipe } from '@/shared/pipes/validation.pipe';

import { cpus } from 'os';
import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from '@/app.module';

// HTTPS授權問題
process.env.NODE_TLS_REJECT_UNAUTHORIZE;

// console 顯示樣式
const { log, warn, info } = console;
const color = c => (isDevMode ? c : '');
Object.assign(global.console, {
  log: (...args) => log('[log]', ...args),
  warn: (...args) =>
    warn(color('\x1b[33m%s\x1b[0m'), '[warn]', '[app]', ...args),
  info: (...args) =>
    info(color('\x1b[34m%s\x1b[0m'), '[info]', '[app]', ...args),
  error: (...args) =>
    info(color('\x1b[31m%s\x1b[0m'), '[error]', '[app]', ...args),
});

// server選項設定
const appOptions: any = isProdMode ? { logger: true } : {};

async function bootstrap() {
  const app = await NestFactory.create(AppModule, appOptions);
  app.use(helmet());
  app.use(compression());
  app.use(bodyParser.json({ limit: '1mb' }));
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(rateLimit({ max: 1000, windowMs: 15 * 60 * 1000 }));
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(
    new TransformInterceptor(new Reflector()),
    // new ErrorInterceptor(new Reflector()),
  );
  return await app.listen(APP_CONFIG.APP.PORT);
}

if (!isProdMode) {
  bootstrap().then(_ => {
    console.info(
      `Server is running on port ${APP_CONFIG.APP.PORT} in process ${process.pid}`,
    );
  });
} else {
  // cluster 最大化運用cpu資源
  if (cluster.isMaster) {
    console.info(`RUN ${environment} ENVIRONMENT`);
    for (const _ of cpus()) {
      cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
      console.log(
        'Worker ' +
          worker.process.pid +
          ' died with code: ' +
          code +
          ', and signal: ' +
          signal,
      );
      console.log('Starting a new worker');
      cluster.fork();
    });
  } else {
    bootstrap().then(_ => {
      console.info(
        `Server is running on port ${APP_CONFIG.APP.PORT} in process ${process.pid}`,
      );
    });
  }
}
