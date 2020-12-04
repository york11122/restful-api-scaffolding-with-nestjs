import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import {
  Injectable,
  NestInterceptor,
  CallHandler,
  ExecutionContext,
} from '@nestjs/common';
import {
  THttpSuccessResponse,
  EHttpStatus,
} from '@/shared/interfaces/http.interface';
import { TMessage } from '@/shared/interfaces/http.interface';
import * as META from '@/shared/constants/meta.constant';
import * as TEXT from '@/shared/constants/text.constant';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, THttpSuccessResponse<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<THttpSuccessResponse<T>> {
    const call$ = next.handle();
    const target = context.getHandler();
    const request = context.switchToHttp().getRequest();

    const description = this.reflector.get<TMessage>(
      META.META_DESCRIPTION,
      target,
    );
    const version = this.reflector.get<TMessage>(META.META_VERSION, target);
    const copyright = this.reflector.get<TMessage>(META.META_COPYRIGHT, target);
    const message =
      this.reflector.get<TMessage>(META.HTTP_SUCCESS_MESSAGE, target) ||
      TEXT.HTTP_DEFAULT_SUCCESS_TEXT;

    const meta =
      description || version || copyright
        ? { description, version, copyright }
        : undefined;
    return call$.pipe(
      map((data: any) => {
        return { status: EHttpStatus.Success, data, meta };
      }),
    );
  }
}
