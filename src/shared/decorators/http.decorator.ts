import * as lodash from 'lodash';
import * as META from '@/shared/constants/meta.constant';
import * as TEXT from '@/shared/constants/text.constant';
import { SetMetadata } from '@nestjs/common';
import { TMessage } from '@/shared/interfaces/http.interface';

interface IBuildDecoratorOption {
  copyright?: TMessage;
  version?: TMessage;
  description: TMessage;
  errMessage?: TMessage;
  successMessage?: TMessage;
}

interface IHandleOption {
  copyright?: TMessage;
  version?: TMessage;
  description: TMessage;
}

type THandleOption = TMessage | IHandleOption;

const buildHttpDecorator = (
  options: IBuildDecoratorOption,
): MethodDecorator => {
  const {
    description,
    version,
    copyright,
    errMessage,
    successMessage,
  } = options;
  return (_, __, descriptor: PropertyDescriptor) => {
    if (description) {
      SetMetadata(META.META_DESCRIPTION, description)(descriptor.value);
    }
    if (version) {
      SetMetadata(META.META_VERSION, version)(descriptor.value);
    }
    if (copyright) {
      SetMetadata(META.META_COPYRIGHT, copyright)(descriptor.value);
    }
    if (errMessage) {
      SetMetadata(META.HTTP_ERROR_MESSAGE, errMessage)(descriptor.value);
    }
    if (successMessage) {
      SetMetadata(META.HTTP_SUCCESS_MESSAGE, successMessage)(descriptor.value);
    }
    return descriptor;
  };
};

export function handle(args: THandleOption): MethodDecorator;
export function handle(...args) {
  const option = args[0];
  const isOption = (value: THandleOption): value is IHandleOption =>
    lodash.isObject(value);
  const description: TMessage = isOption(option) ? option.description : option;
  const version: TMessage = option.version;
  const copyright: TMessage = option.copyright;

  const errMessage: TMessage = description + TEXT.HTTP_ERROR_SUFFIX;
  const successMessage: TMessage = description + TEXT.HTTP_SUCCESS_SUFFIX;

  return buildHttpDecorator({
    description,
    version,
    copyright,
    errMessage,
    successMessage,
  });
}
export const HttpProcessor = handle;
