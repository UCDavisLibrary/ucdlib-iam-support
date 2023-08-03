import BaseConfig from '@ucd-lib/iam-support-lib/src/utils/config.cjs';

class CliConfig extends BaseConfig{
  constructor(){
    super();
    const env = process.env;
  }
}

export default new CliConfig();
