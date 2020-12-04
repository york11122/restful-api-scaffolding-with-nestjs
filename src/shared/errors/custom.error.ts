import { HttpException, HttpStatus } from '@nestjs/common';
import { TExceptionOption, TMessage } from '@/shared/interfaces/http.interface';
import * as TEXT from '@/shared/constants/text.constant';

export class HttpError extends HttpException {
  constructor(options: TExceptionOption, statusCode?: HttpStatus) {
    super(options, statusCode || HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export class ValidationError extends HttpError {
  constructor(options: TExceptionOption) {
    super(
      options || TEXT.HTTP_BAD_REQUEST_TEXT_DEFAULT,
      HttpStatus.BAD_REQUEST,
    );
  }
}

export class HttpUnauthorizedError extends HttpError {
  constructor(options?: TMessage) {
    super(
      {
        message: options || TEXT.HTTP_UNAUTHORIZED_TEXT_DEFAULT,
        code: TEXT.ERROR_CODE.UNAUTHORIZED,
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
