import BaseConfig from '@ucd-lib/iam-support-lib/src/utils/config.cjs';

class Config extends BaseConfig{
  constructor(){
    super();
    const env = process.env;

    this.apiPrefix = env.UCDLIB_API_API_PREFIX || '/json';
    this.apiHostPort = env.UCDLIB_API_HOST_PORT | '';

    this.keycloak.apiClientId = this.getEnv('UCDLIB_KEYCLOAK_API_CLIENT_ID', 'iam-api');
  }
}

export default new Config();
