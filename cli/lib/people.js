const config = require('./cli-config');

class PeopleCli {
  async searchUcd(options){
    const { UcdIamModel } = await import('@ucd-lib/iam-support-lib/index.js');
    UcdIamModel.init(config.ucdIamApi);
    console.log('lets look up sone people');
  }
}

module.exports = new PeopleCli();