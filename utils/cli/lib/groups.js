import config from './cli-config.js';
import UcdlibGroups from '@ucd-lib/iam-support-lib/src/utils/groups.js';

class GroupsCli {



  async groupsUcd(options){
    let group;
    const a = await UcdlibGroups.groupQuery(options);
    group = a.res.rows;

    console.log(group);

    if(options.file){
      //Write to file if necessary not build
    }
  }
}

export default new GroupsCli();
