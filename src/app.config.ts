import * as path from 'path';
import { argv } from 'yargs';
const packageJson = require(path.resolve(__dirname, '..', 'package.json'));

export const APP = {
  PORT: 8081,
  ROOT_PATH: __dirname,
  NAME: 'name',
};

export const CROSS_DOMAIN = {
  allowedOrigins: [],
  allowedReferer: '',
};

export const REDIS = {
  host: argv.redis_host || 'localhost',
  port: argv.redis_port || 32768,
  ttl: null,
  defaultCacheTTL: 60 * 60 * 24,
};

// export const AUTH = {
//   expiresIn: argv.auth_expires_in || 3600,
//   data: argv.auth_data || { user: 'root' },
//   jwtTokenSecret: argv.auth_key || 'nodepress',
//   defaultPassword: argv.auth_default_password || 'root',
// };

// export const GOOGLE = {
//   serverAccountFilePath: path.resolve(__dirname, '..', 'classified', 'google_service_account.json'),
// };

export const INFO = {
  name: packageJson.name,
  version: packageJson.version,
  author: packageJson.author,
  homepage: packageJson.homepage,
};
