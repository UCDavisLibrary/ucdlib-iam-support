class AppConfig {
  constructor(){
    const env = process.env;
    
    this.env = env.UCDLIB_APP_ENV == 'dev' ? 'dev' : 'prod';
    this.version = env.APP_VERSION;
    this.routes = ['foo', 'bar'];
    this.title = 'UC Davis Library Identity and Access Management';
  }
}

module.exports = new AppConfig();