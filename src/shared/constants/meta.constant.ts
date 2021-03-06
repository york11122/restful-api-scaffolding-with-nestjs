import * as constants from '@nestjs/common/constants';
import { CACHE_KEY_METADATA } from '@nestjs/common/cache/cache.constants';

export const HTTP_ERROR_CODE = '__customHttpErrorCode__';
export const HTTP_SUCCESS_CODE = constants.HTTP_CODE_METADATA;

export const HTTP_MESSAGE = '__customHttpMessage__';
export const HTTP_ERROR_MESSAGE = '__customHttpErrorMessage__';
export const HTTP_SUCCESS_MESSAGE = '__customHttpSuccessMessage__';

export const META_DESCRIPTION = '__description__';
export const META_VERSION = '__version__';
export const META_COPYRIGHT = '__copyright__';

export const HTTP_RES_TRANSFORM_PAGINATE = '__customHttpResTransformPagenate__';

export const HTTP_CACHE_KEY_METADATA = CACHE_KEY_METADATA;
export const HTTP_CACHE_TTL_METADATA = '__customHttpCacheTTL__';