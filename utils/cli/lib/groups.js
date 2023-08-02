import UcdlibGroups from '@ucd-lib/iam-support-lib/src/utils/groups.js';
import pg from '@ucd-lib/iam-support-lib/src/utils/pg.js';
import utils from './utils.js';

class GroupsCli {



  async groupsUcd(options){
    const groups = await UcdlibGroups.groupQuery(options, {returnHead: options.return_head});
    if ( groups.err ) {
      console.log(groups.err);
      await pg.client.end();
      return;
    }
    if ( !groups.res.rowCount ) {
      console.log('No groups found');
      await pg.client.end();
      return;
    }
    utils.logObject(groups.res.rows);
    await pg.client.end();

  }

  async removeHead(group_id){
    const group = await UcdlibGroups.getById(group_id);
    if ( group.err ) {
      console.log(group.err);
      await pg.client.end();
      return;
    }
    if ( !group.res.rowCount ) {
      console.log('No group found');
      await pg.client.end();
      return;
    }
    const rmHead = await UcdlibGroups.removeGroupHead(group_id);
    if ( rmHead.err ) {
      console.log(rmHead.err);
      await pg.client.end();
      return;
    }
    console.log(`Removed head of group ${group_id}`);
    await pg.client.end();
  }

  async inspect(group_id){
    const args = {returnMembers: true, returnParent: true, returnChildren: true};
    const group = await UcdlibGroups.getById(group_id, args);
    if ( group.err ) {
      console.log(group.err);
      await pg.client.end();
      return;
    }
    if ( !group.res.rowCount ) {
      console.log('No group found');
      await pg.client.end();
      return;
    }
    utils.logObject(group.res.rows[0]);
    await pg.client.end();
  }
}

export default new GroupsCli();
