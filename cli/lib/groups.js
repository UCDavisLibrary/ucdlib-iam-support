const config = require('./cli-config');

class GroupsCli {



  async groupsUcd(options){
    let group;
    const { default: UcdlibGroups } = await import('@ucd-lib/iam-support-lib/src/utils/groups.js');
    const all = await UcdlibGroups.getAll(true);
    const allActive = await UcdlibGroups.getAll();
    const allArchive = await UcdlibGroups.getArchived();
    const parents = await UcdlibGroups.getParents();
    const child = await UcdlibGroups.getParents(false);
    const orgs = await UcdlibGroups.getOrgGroups();


    if(options.active){
      group = allActive.res.rows;
    }else if(options.archived){
      group = allArchive.res.rows;
    }else if(options.org){
      group = orgs.res.rows;
    }else if(options.parent){
      group = parents.res.rows;
    }else if(options.child){
      group = child.res.rows;
    }else if(options.parent_group){
      let op = options.parent_group;
      let pg_all = all.res.rows;
      let obj = pg_all.find(o => o.name === op);      
      const file = [
        { 
          parent_id: obj.id
        }
      ];
      const aFilt = pg_all.filter(({ parent_id }) =>
        file.findIndex((f) => f.parent_id === parent_id) > -1
      )

      group = aFilt;
    }else if(options.group_name){
      let op = options.group_name;
      let gn_all = all.res.rows;
      const file = [
        { 
          type_name: op
        }
      ];
      const aFilt = gn_all.filter(({ type_name }) =>
        file.findIndex((f) => f.type_name === type_name) > -1
      )

      group = aFilt;
    }else {
      group = all.res.rows;
    }
    
    console.log(group);
    

  }
}

module.exports = new GroupsCli();