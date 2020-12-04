// 响应状态
export enum EHttpStatus {
  Error = 'error',
  Success = 'success',
}

export type TMessage = string;

export type TExceptionOption =
  | TMessage
  | {
      message: TMessage;
      code?: TMessage;
      detail?: any;
    };

export interface IHttpResult<T> {
  data: T;
  params: any;
}

export interface IHttpResponseBase {
  status: EHttpStatus;
  message?: TMessage;
}

export type THttpErrorResponse = IHttpResponseBase & {
  error?: any;
  debug?: string;
};

export type THttpSuccessResponse<T> = IHttpResponseBase & {
  data: T | IHttpResult<T>;
};

export type THttpResponse<T> = THttpErrorResponse | THttpSuccessResponse<T>;
