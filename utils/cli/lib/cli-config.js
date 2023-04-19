const BaseConfig = require('@ucd-lib/iam-support-lib/src/utils/config.cjs');

class CliConfig extends BaseConfig{
  constructor(){
    super();
    const env = process.env;
  }
}
  
module.exports = new CliConfig();