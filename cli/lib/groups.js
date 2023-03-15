const config = require('./cli-config');

class GroupsCli {



  async groupsUcd(options){
    let group;
    const { default: UcdlibGroups } = await import('@ucd-lib/iam-support-lib/src/utils/groups.js');
    const a = await UcdlibGroups.queryTest(options);

    const all = await UcdlibGroups.getAll(true);
    const allActive = await UcdlibGroups.getAll();
    const allArchive = await UcdlibGroups.getArchived();
    const parents = await UcdlibGroups.getParents(true);
    const parents_groups = await UcdlibGroups.getParentsGroups(options.parent_group);
    const group_type = await UcdlibGroups.getGroupType(options.group_type);
    const type_name = await UcdlibGroups.getTypeName(options.type_name);
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
      group = parents_groups.res.rows;
    }else if(options.group_type){
      group = group_type.res.rows;
    }else if(options.type_name){
      group = type_name.res.rows;
    }else {
      group = all.res.rows;
    }
    
    console.log(group);
    

  }
}

module.exports = new GroupsCli();