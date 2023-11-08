const BaseConfig = require('@ucd-lib/iam-support-lib/src/utils/config.cjs');

class AppConfig extends BaseConfig {
  constructor(){
    super();
    const env = process.env;
    
    this.routes = ['onboarding', 'separation', 'logout', 'permissions', 'orgchart'];
    this.title = 'UC Davis Library Identity and Access Management';
    this.baseUrl = env.UCDLIB_BASE_URL || 'http://localhost:3000' //TODO: update me;
  }
}

module.exports = new AppConfig();