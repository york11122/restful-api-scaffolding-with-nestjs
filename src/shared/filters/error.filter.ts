import * as lodash from 'lodash';
import { isDevMode } from '@/app.environment';
import {
  EHttpStatus,
  THttpErrorResponse,
  TMessage,
  TExceptionOption,
} from '@/shared/interfaces/http.interface';
import {
  ExceptionFilter,
  Catch,
  HttpException,
  ArgumentsHost,
  HttpStatus,
  NotFoundException,
} from '@nestjs/common';
import { HttpError } from '@/shared/errors/custom.error';
import * as TEXT from '@/shared/constants/text.constant';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse();
    const request = host.switchToHttp().getRequest();
    const isString = (value): value is TMessage => lodash.isString(value);

    let status = HttpStatus.INTERNAL_SERVER_ERROR;

    const data: THttpErrorResponse = {
      status: EHttpStatus.Error,
      error: { message: TEXT.HTTP_INTERNAL_SERVER_ERROR_TEXT_DEFAULT },
      debug: isDevMode ? exception.stack : undefined,
    };
    //error interceptor 攔截後封裝之錯誤
    if (exception instanceof HttpException) {
      const TOption = exception.getResponse() as TExceptionOption;
      status = exception.getStatus();
      data.error = isString(TOption) ? { message: TOption } : TOption;
      data.message = undefined;
    }

    if (exception instanceof NotFoundException) {
      data.error = {
        message: '資源不存在',
        details: `接口 ${request.method} -> ${request.url} 无效`,
      };
    }
    return response.status(status).json(data);
  }
}
