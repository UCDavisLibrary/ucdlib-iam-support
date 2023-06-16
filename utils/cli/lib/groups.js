const config = require('./cli-config');

class GroupsCli {



  async groupsUcd(options){
    let group;
    const { default: UcdlibGroups } = await import('@ucd-lib/iam-support-lib/src/utils/groups.js');
    const a = await UcdlibGroups.groupQuery(options);
    group = a.res.rows;

    console.log(group);
        
    if(options.file){
      //Write to file if necessary not build
    }
  }
}

module.exports = new GroupsCli();