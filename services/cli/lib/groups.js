import UcdlibGroups from '@ucd-lib/iam-support-lib/src/utils/groups.js';
import UcdlibEmployees from '@ucd-lib/iam-support-lib/src/utils/employees.js';
import pg from '@ucd-lib/iam-support-lib/src/utils/pg.js';
import utils from './utils.js';

import * as fs from 'node:fs/promises';

class GroupsCli {

  async list(options){
    const groups = await UcdlibGroups.groupQuery(options, {returnHead: options.return_head});
    if ( groups.err ) {
      console.log(groups.err);
      await pg.pool.end();
      return;
    }
    if ( !groups.res.rowCount ) {
      console.log('No groups found');
      await pg.pool.end();
      return;
    }
    utils.logObject(groups.res.rows);
    await pg.pool.end();

  }

  async removeHead(group_id){
    const group = await UcdlibGroups.getById(group_id);
    if ( group.err ) {
      console.log(group.err);
      await pg.pool.end();
      return;
    }
    if ( !group.res.rowCount ) {
      console.log('No group found');
      await pg.pool.end();
      return;
    }
    const rmHead = await UcdlibGroups.removeGroupHead(group_id);
    if ( rmHead.err ) {
      console.log(rmHead.err);
      await pg.pool.end();
      return;
    }
    console.log(`Removed head of group ${group_id}`);
    await pg.pool.end();
  }

  async removeMember(group_id, employee_id, options){
    const force = options.force;
    const idType = options.idtype;
    group_id = parseInt(group_id);

    // validate group exists
    let group = await this._validateGroup(group_id);
    if ( !group ) return;

    // validate employee exists
    let employee = await utils.validateEmployee(employee_id, idType, {returnGroups: true});
    if ( !employee ) return;

    // validate employee is member
    const isMember = employee.groups.find(g => g.id === group_id);
    if ( !isMember ) {
      console.log(`Error: ${employee.first_name} ${employee.last_name} is not a member of ${group.name}`);
      await pg.pool.end();
      return;
    }

    // validate employee is not head
    const isHead = employee.groups.find(g => g.id === group_id && g.isHead);
    if ( isHead && !force ) {
      console.log(`Error: ${employee.first_name} ${employee.last_name} is head of ${group.name}. Most groups must have a head.`);
      console.log('Rerun with --force option to remove employee as head.');
      await pg.pool.end();
      return;
    }

    // if group is department, validate employee belongs to another department
    if ( group.part_of_org && employee.groups.filter(g => g.partOfOrg).length == 1 && !force) {
      console.log(`Error: Every employee must belong to at least one department.`);
      console.log('Rerun with --force option to remove employee from department.');
      await pg.pool.end();
      return;
    }

    const r = await UcdlibEmployees.removeEmployeeFromGroup(employee.id, group_id);
    if ( r.err ) {
      console.log(r.err);
    } else {
      console.log(`Removed ${employee.first_name} ${employee.last_name} from ${group.name}`);
    }

    await pg.pool.end();
  }

  async moveAllMembers(from_group_id, to_group_id){
    // validate from group exists
    let fromGroup = await this._validateGroup(from_group_id);
    if ( !fromGroup ) return;

    // validate to group exists
    let toGroup = await this._validateGroup(to_group_id);
    if ( !toGroup ) return;

    // move all members from one group to another
    const res = await UcdlibGroups.moveAllMembers(from_group_id, to_group_id);
    if ( res.err ) {
      console.log(res.err);
      await pg.pool.end();
      return;
    }

    const count = res.res?.rows?.[0]?.count || 0;
    console.log(`Moved ${count} members from ${fromGroup.name} to ${toGroup.name}`);

    await pg.pool.end();
  }

  async addMember(group_id, employee_id, options){
    const idType = options.idtype;
    const force = options.force;
    group_id = parseInt(group_id);

    // validate group exists
    let group = await this._validateGroup(group_id);
    if ( !group ) return;

    // validate employee exists
    let employee = await utils.validateEmployee(employee_id, idType, {returnGroups: true});
    if ( !employee ) return;

    // validate employee is not already member
    const isMember = employee.groups.find(g => g.id === group_id);
    if ( isMember ) {
      console.log(`Error: ${employee.first_name} ${employee.last_name} is already a member of ${group.name}`);
      await pg.pool.end();
      return;
    }

    // validate employee is not aleady in another department
    const inAnotherDepartment = employee.groups.find(g => g.partOfOrg && g.id !== group_id);
    if ( inAnotherDepartment && !force) {
      console.log(`Error: ${employee.first_name} ${employee.last_name} is already a member of another department.`);
      console.log('Rerun with --force option to add employee to this department as well.');
      await pg.pool.end();
      return;
    }

    const r = await UcdlibEmployees.addEmployeeToGroup(employee.id, group_id, false);
    if ( r.err ) {
      console.log(r.err);
    } else {
      console.log(`Added ${employee.first_name} ${employee.last_name} to ${group.name}`);
    }

    await pg.pool.end();
  }

  async addHead(group_id, employee_id, options){
    const addAsMember = options.member;
    const idType = options.idtype;
    group_id = parseInt(group_id);

    // validate group exists
    let group = await this._validateGroup(group_id, {returnHead: true});
    if ( !group ) return;

    // check if group already has head
    if ( group.head.length ) {
      console.log(`${group.name} already has a head:`);
      utils.logObject(group.head);
      console.log('Remove current head before adding new head');
      await pg.pool.end();
      return;
    }

    // validate employee exists
    let employee = await utils.validateEmployee(employee_id, idType, {returnGroups: true});
    if ( !employee ) return;

    // validate employee is member
    const isMember = employee.groups.find(g => g.id === group_id);
    if ( !isMember && !addAsMember ) {
      console.log('Employee is not a member of this group, and must be a member to be added as head.');
      console.log('Rerun with --member option to add employee as member and head.');
      await pg.pool.end();
      return;
    }

    // validate that employee is not aleady in another department
    const inAnotherDepartment = employee.groups.find(g => g.partOfOrg && g.id !== group_id);
    if ( inAnotherDepartment ) {
      console.log('Employee is already a member of another department.');
      console.log('Remove employee from other department before adding as head.');
      await pg.pool.end();
      return;
    }

    if ( isMember ){
      const r = await UcdlibGroups.setGroupHead(group_id, employee.id);
      if ( r.err ) {
        console.log(r.err);
        await pg.pool.end();
        return;
      }
    } else {
      const r = await UcdlibEmployees.addEmployeeToGroup(employee.id, group_id, true)
      if ( r.err ) {
        console.log(r.err);
        await pg.pool.end();
        return;
      }
    }
    console.log(`Added ${employee.first_name} ${employee.last_name} as head of ${group.name}`);
    await pg.pool.end();
  }

  async inspect(group_id){
    const args = {returnMembers: true, returnParent: true, returnChildren: true};
    const group = await UcdlibGroups.getById(group_id, args);
    if ( group.err ) {
      console.log(group.err);
      await pg.pool.end();
      return;
    }
    if ( !group.res.rowCount ) {
      console.log('No group found');
      await pg.pool.end();
      return;
    }
    if ( group.res.rowCount > 1 ) {
      utils.logObject(group.res.rows);
    } else {
      utils.logObject(group.res.rows[0]);
    }
    await pg.pool.end();
  }

  /**
   * @description Update a group property
   * @param {String} id - Group id
   * @param {String} property - Column name to update
   * @param {String} value - New value
   * @returns
   */
    async updateProperty(id, property, value ){
      id = id.trim();
      const data = {
        [property]: value
      };
      const r = await UcdlibGroups.update(id, data);
      await pg.pool.end();
      if ( r.err ) {
        console.error(`Error updating group record\n${r.err.message}`);
        return;
      }
      console.log(`Updated ${r.res.rowCount} group records`);
    }

  async createTemplate(name){
    const template = {
      type: 1,
      name: '',
      nameShort: '',
      parentId: null,
      siteId: null,
      archived: false,
      rtName: ''
    };

    // write template to json file
    if ( !name.endsWith('.json') ) name += '.json';
    await fs.writeFile(name, JSON.stringify(template, null, 2));
  }

  async create(file){

    // Read group template file
    const fileContents = await fs.readFile(file, 'utf8');
    const group = JSON.parse(fileContents);
    if ( !group.name ) {
      console.error(`A name is required to create a group`);
      return;
    }

    // Create group
    const r = await UcdlibGroups.create(group);
    if ( r.err ) {
      console.error(`Error creating group\n${r.err.message}`);
      await pg.pool.end();
      return;
    }
    console.log(`Created group: ${group.name} with id ${r.res.rows[0].id}`);
    await pg.pool.end();

  }

  /**
   * @description Validate group exists
   * @param {Int} group_id - Group id
   * @param {Object} args - Additional arguments to pass to UcdlibGroups.getById
   * @returns {Object} Group object or null if group does not exist
   */
  async _validateGroup(group_id, args){
    // validate group exists
    let group = await UcdlibGroups.getById(group_id, args);
    if ( group.err ) {
      console.log(group.err);
      await pg.pool.end();
      return;
    }
    if ( !group.res.rowCount ) {
      console.log('No group found');
      await pg.pool.end();
      return;
    }
    return group.res.rows[0];
  }

}

export default new GroupsCli();
