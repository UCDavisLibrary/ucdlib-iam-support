import KcAdminClient from '@keycloak/keycloak-admin-client';
import UcdlibEmployees from "./employees.js";
import UcdlibGroups from "./groups.js";
import {Issuer} from 'openid-client';

class KeycloakAdmin{

  constructor(){
    this.config = {};

    this.logActions = ['create', 'update', 'delete'];
    this.logEntities = ['user', 'group', 'groupMembership'];

    // kcName: the name of the attribute in keycloak
    // topLevel: if true, the attribute is a top level attribute in keycloak (not in attributes object)
    // entity: the entity type in the database
    // entityProp: the property name in the database entity
    this.userAttributes = [
      {kcName: 'iamId', entity: 'employee', entityProp: 'iam_id'},
      {kcName: 'employeeId', entity: 'employee', entityProp: 'employee_id'},
      {kcName: 'firstName', topLevel: true, entity: 'employee', entityProp: 'first_name'},
      {kcName: 'lastName', topLevel: true, entity: 'employee', entityProp: 'last_name'},
      {kcName: 'email', topLevel: true, entity: 'employee', entityProp: 'email'},
      {kcName: 'title', entity: 'employee', entityProp: 'title'},
      {kcName: 'supervisorIamId', entity: 'employee', entityProp: 'supervisor_id'},
      {kcName: 'supervisorFirstName', entity: 'supervisor', entityProp: 'first_name'},
      {kcName: 'supervisorLastName', entity: 'supervisor', entityProp: 'last_name'},
    ];

    // same properties as userAttributes
    // note: users inherit the attributes of groups, so make sure to prefix the kcName
    this.groupAttributes = [
      {kcName: 'name', topLevel: true, entity: 'group', entityProp: 'name'},
      {kcName: 'groupDbId', entity: 'group', entityProp: 'id'},
      {kcName: 'groupType', entity: 'group', entityProp: 'type_name'},
      {kcName: 'groupNameShort', entity: 'group', entityProp: 'name_short'},
      {kcName: 'groupPartOfOrg', entity: 'group', entityProp: 'part_of_org'},
    ]
    this.resetState();
  }

  /**
   * @description Resets class state properties such as logs and caches
   */
  resetState(){
    this.users = {};
    this.employees = {};
    this.kcGroups = [];
    this.dbGroups = [];
    this.kcGroupMembershipByUser = {};
    this.dbGroupMembershipByUserId = {};
    this.userIdToIamId = {};
    this.iamIdToUserId = {};
    this.realmRolesByName = {};
    this.logs = [];
    this.logInRealTime = false;
    this.stopRefreshInterval();
  }

  /**
   * @description Initializes the keycloak admin client
   * @param {Object} config - The keycloak object from the config file
   */
  async init(config){
    this.config = config;
    const initConfig = {
      baseUrl: config.baseUrl,
      realmName: config.realmName
    }
    this.client = new KcAdminClient(initConfig);

    const authConfig = {
      username: config.username,
      password: config.password,
      grantType: config.grantType,
      clientId: config.clientId
    }
    await this.client.auth(authConfig);

    if ( config.refreshInterval ){
      this.startRefreshInterval();
    }
  }

  /**
   * @description Starts an interval for getting a new access token
   * @param {Number} interval - The interval in milliseconds
   */
  startRefreshInterval(interval){
    interval = interval || this.config.refreshInterval;
    if ( this.config.refreshInterval ){
      this.refreshInterval = setInterval(() => this.refreshAccessToken(), interval);
    }
  }

  /**
   * @description Stops the interval that gets a new access token
   */
  stopRefreshInterval(){
    if ( this.refreshInterval ){
      clearInterval(this.refreshInterval);
    }
  }

  /**
   * @description Refreshes the access token for the keycloak admin client
   */
  async refreshAccessToken(){
    const keycloakIssuer = await Issuer.discover(
      `${this.config.baseUrl}/realms/${this.config.realmName}`,
    );
    const client = new keycloakIssuer.Client({
      client_id: this.config.clientId,
      token_endpoint_auth_method: 'none'
    });

    let tokenSet = await client.grant({
      grant_type: this.config.grantType,
      username: this.config.username,
      password: this.config.password
    });

    this.client.setAccessToken(tokenSet.access_token);
  }

  /**
   * @description Gets all users from keycloak
   * @param {Object} query - User query object as defined by API docs
   * @returns {Array}
   */
  async getUsers(query={}){
    if ( !this.refreshInterval ){
      await this.refreshAccessToken();
    }
    return await this.client.users.find(query);
  }

  /**
   * @description Gets all users from keycloak or cache. Grouped by username
   * @returns {Object} - this.users
   */
  async getAllUsers(){
    if ( Object.keys(this.users).length ) return this.users;
    const users = await this.getUsers({max: 1000});
    for (const user of users) {
      this.users[user.username] = user;
    }
    return this.users;
  }

  /**
   * @description Gets all groups from keycloak
   * @param {Object} query - Group query object as defined by API docs
   * @returns {Array}
   */
  async getGroups(query={}){
    if ( !this.refreshInterval ){
      await this.refreshAccessToken();
    }
    return await this.client.groups.find(query);
  }

  /**
   * @description Gets all group membership from local db and groups by user id
   * @returns {Array} - this.dbGroupMembershipByUserId
   */
  async getDbGroupMembership(){
    if ( Object.keys(this.dbGroupMembershipByUserId).length ) return this.dbGroupMembershipByUserId;
    const groupMembership = await UcdlibGroups.getGroupMembershipWithIds(null, true);
    if ( groupMembership.err ) throw groupMembership.err;
    for (const row of groupMembership.res.rows){
      if ( !this.dbGroupMembershipByUserId[row.user_id] ){
        this.dbGroupMembershipByUserId[row.user_id] = [];
      }
      this.dbGroupMembershipByUserId[row.user_id].push(row);
    }
    return this.dbGroupMembershipByUserId;
  }

  /**
   * @description Gets all groups from the database or cache
   * @returns {Array} - this.dbGroups
   */
  async getDbGroups(){
    if ( this.dbGroups.length ) return this.dbGroups;
    const groups = await UcdlibGroups.getAll();
    if ( groups.err ) throw groups.err;
    this.dbGroups = groups.res.rows;
    return this.dbGroups;
  }

  /**
   * @description Gets all groups from keycloak or cache
   * @returns 
   */
  async getAllGroups(){
    if ( this.kcGroups.length ) return this.kcGroups;
    let groups = await this.getGroups({briefRepresentation: false, max: 1000});
    groups = await this.getGroupMembers(groups);
    groups = this.setGroupParentId(groups);
    this.kcGroups = groups;
    return this.kcGroups;
  }

  /**
   * @description Recursively sets the parentGroupId property on a list of groups/subgroups
   * @param {Array} groups - List of groups returned by keycloak
   * @param {String} parentGroupId - The id of the parent group
   * @returns {Array} - With a group.parentGroupId property added
   */
  setGroupParentId(groups, parentGroupId){
    if ( !groups ) groups = [];
    if ( !Array.isArray(groups) ) groups = [groups];
    for ( const group of groups ){
      group.parentGroupId = parentGroupId;
      group.subGroups = this.setGroupParentId(group.subGroups, group.id);
    }
    return groups;
  }

  /**
   * @description Recursively gets all members of a list of groups/subgroups
   * @param {Array} groups - List of groups returned by keycloak
   * @param {Boolean} skipNonDbGroups - If true, skips groups that don't have a groupDbId attribute
   * @returns {Array} - With a group.members property added
   */
  async getGroupMembers(groups, skipNonDbGroups=true){
    if ( !Array.isArray(groups) ) groups = [groups];
    for ( const group of groups ){
      if ( !this.refreshInterval ){
        await this.refreshAccessToken();
      }
      if ( skipNonDbGroups && !group.attributes.groupDbId ) {
        group.members = [];
        continue;
      }
      group.members = await this.client.groups.listMembers({id: group.id, briefRepresentation: true});
      for (const member of group.members) {
        if ( !this.kcGroupMembershipByUser[member.id] ){
          this.kcGroupMembershipByUser[member.id] = [];
        }
        this.kcGroupMembershipByUser[member.id].push(group.id);
      }
      group.subGroups = await this.getGroupMembers(group.subGroups);
    }
    return groups;
  }

  /**
   * @description Gets a keycloak group from the class cache
   * @param {String} id - The id of the group
   * @param {String} idType - The type of id, either kcId or dbId
   * @param {Array} groups - The list of groups to search - defaults to this.kcGroups
   * @param {Boolean} topLevelOnly - If true, only searches top level groups
   * @returns 
   */
  getCachedKcGroup(id, idType='kcId', groups=this.kcGroups, topLevelOnly=false){
    if ( !id ) return;
    for ( const group of groups ){
      if ( idType === 'kcId' && group.id === id ){
        return group;
      } 
      if ( idType === 'dbId' ){
        const attrs = group.attributes.groupDbId || [];
        if ( attrs.includes(id.toString()) ) return group;
      } 
      if ( idType === 'name' && group.name === id ){
        return group;
      }
      if ( topLevelOnly ) continue;
      if ( group.subGroups && Array.isArray(group.subGroups) ){
        const subGroup = this.getCachedKcGroup(id, idType, group.subGroups);
        if ( subGroup ) return subGroup;
      }
    }
  }

  /**
   * @description Copies users, groups, group structure, and group membership to keycloak from local db
   * @param {Object} options - Options object, properties include:
   * - createUsers - If true, will create users in keycloak that don't exist
   * - removeGroups - If true, will remove groups from keycloak that are archived in the database
   */
  async syncAll(options={}){

    await this.syncEmployees(options.createUsers);
    await this.syncGroups(options.removeGroups);
    await this.syncGroupStructure();
    await this.syncGroupMembership();
    await this.syncSupervisorsGroup();
  }

  /**
   * @description Gets 'Supervisors' group from keycloak, or creates it if it doesn't exist
   */
  async getSupervisorsGroup(){
    await this.getAllGroups();
    const supervisorsGroup = this.getCachedKcGroup('Supervisors', 'name', this.kcGroups, true);
    if ( supervisorsGroup ) return supervisorsGroup;

    const group = await this.createGroup({name: 'Supervisors'});
    this.kcGroups.push(group);
    return group;
  }

  async syncSupervisorsGroup(){
    const group = await this.getSupervisorsGroup();
    await this.getAllUsers();
    const supervisors = await UcdlibEmployees.getAllSupervisors();
    if ( supervisors.err ) throw supervisors.err;
    
    const localMembership = [];
    for ( const supervisor of supervisors.res.rows ){
      if ( !supervisor.user_id ) continue;
      const user = this.users[supervisor.user_id];
      if ( !user ) continue;
      localMembership.push(user.id);
    }

    const kcMembership = group.members.map(m => m.id);
    
    const toAdd = localMembership.filter(m => !kcMembership.includes(m));
    const toRemove = kcMembership.filter(m => !localMembership.includes(m));

    for ( const kcId of toAdd ){
      try {
        await this.client.users.addToGroup({id: kcId, groupId: group.id});
        this.writeLog(kcId, 'update', 'groupMembership', `Added user to group ${group.name}`, true);
      } catch (error) {
        this.writeLog(kcId, 'update', 'groupMembership', `Failed to add user to group ${group.name}`, false, error)
      }
    }

    for ( const kcId of toRemove ){
      try {
        await this.client.users.delFromGroup({id: kcId, groupId: group.id});
        this.writeLog(kcId, 'delete', 'groupMembership', `Removed user from group ${group.name}`, true);
      } catch (error) {
        this.writeLog(kcId, 'delete', 'groupMembership', `Failed to remove user from group ${group.name}`, false, error)
      }
    }

  }

  /**
   * @description Syncs keycloak groups with the database
   * @param {Boolean} remove - If true, will remove groups from keycloak that are archived in the database
   */
  async syncGroups(remove=false){
    await this.getAllGroups();
    await this.getDbGroups();
    for ( const dbGroup of this.dbGroups ){
      let kcGroup = this.getCachedKcGroup(dbGroup.id, 'dbId');
      if ( !kcGroup ){
        if ( !dbGroup.archived) {
          await this.createGroup(dbGroup);
        }
      } else {
        if ( dbGroup.archived ){
          if ( remove ){
            await this.deleteGroup(kcGroup.id);
          } else {
            this.writeLog(kcGroup.id, 'delete', 'group', `Group ${kcGroup.name} is archived, but remove flag is set to false`, false);
          }
          continue;
        }

        const {update, attributes} = this.compareAttributes(kcGroup, dbGroup, 'group');
        if ( update ){
          await this.updateGroup(kcGroup.id, attributes);
        } else {
          this.writeLog(dbGroup.id, 'update', 'group', `No changes made to group ${kcGroup.name}`, false);
        }
      }
    }
  }

  /**
   * @description Syncs keycloak group structure with the database - aka adds/removes subgroups
   */
  async syncGroupStructure(){
    await this.getAllGroups();
    await this.getDbGroups();

    const groupsWithChildren = {};
    for ( const dbGroup of this.dbGroups ){

      // skip archived groups or groups without a parent
      if ( dbGroup.archived || !dbGroup.parent_id) continue;

      // get keycloak group id
      let kcGroup = this.getCachedKcGroup(dbGroup.id, 'dbId');
      if ( !kcGroup ){
        this.writeLog(dbGroup.id, 'update', 'group', `Group structure could not be updated for '${dbGroup.name}'. It does not exist in keycloak`, false);
        continue;
      }

      // get keycloak parent group id
      let kcParentGroup = this.getCachedKcGroup(dbGroup.parent_id, 'dbId');
      if ( !kcParentGroup ){
        this.writeLog(dbGroup.id, 'update', 'group', `Group structure could not be updated for '${dbGroup.name}'. Parent group does not exist in keycloak`, false);
        continue;
      }

      // add group to parent group object
      if ( !groupsWithChildren[kcParentGroup.id] ){
        groupsWithChildren[kcParentGroup.id] = [];
      }
      groupsWithChildren[kcParentGroup.id].push(kcGroup.id);

    }

    // add children to keycloak parent groups if they don't already exist
    for ( const parentGroupId in groupsWithChildren ){
      const kcParentGroup = this.getCachedKcGroup(parentGroupId, 'kcId');
      const children = groupsWithChildren[parentGroupId];
      const currentChildren = kcParentGroup.subGroups.map(g => g.id);
      for (const childId of children) {
        if ( !currentChildren.includes(childId) ){
          const child = this.getCachedKcGroup(childId, 'kcId');

          // have to wrap in a try to catch a bug in keycloak-admin-client
          // https://github.com/keycloak/keycloak/issues/16925
          try {
            await this.client.groups.setOrCreateChild({id: parentGroupId}, {id: childId, name: child.name});
          } catch (error) {
            if ( !error.message.includes('location header is not found in request') ){
              throw error;
            }
          }
          
          this.writeLog(childId, 'update', 'group', `Added group ${childId} to parent group ${parentGroupId}`, true);
        } else {
          this.writeLog(childId, 'update', 'group', `Group ${childId} already exists as a child of parent group ${parentGroupId}`, false);
        }
      }
    }
  }

  /**
   * @description Creates group in keycloak
   * @param {Object} dbGroup - A group object from the database
   */
  async createGroup(dbGroup){
    if ( !this.refreshInterval ){
      await this.refreshAccessToken();
    }
    const attributes = this.groupAttributes.map(attribute => this.getGroupAttributeValue(attribute, dbGroup));
    const payload = {attributes: {}};
    for (const attribute of attributes) {
      const attributeIsEmpty = !attribute.value && typeof attribute.value !== 'boolean';
      if (attributeIsEmpty) continue;
      if (attribute.topLevel) {
        payload[attribute.kcName] = attribute.value;
      } else {
        payload.attributes[attribute.kcName] = [attribute.value];
      }
      
    }
    let group = await this.client.groups.create(payload);
    group = await this.client.groups.findOne({id: group.id});
    group.members = [];
    this.kcGroups.push(group);
    this.writeLog(dbGroup.id, 'create', 'group', `Created group '${group.name}'`, true);
    return group;
  }

  /**
   * @description Updates group in keycloak
   * @param {String} kcGroupId - The keycloak group id
   * @param {Object} data - Payload
   */
  async updateGroup(kcGroupId, data){
    if ( !this.refreshInterval ){
      await this.refreshAccessToken();
    }
    await this.client.groups.update({id: kcGroupId}, data);
    this.writeLog(kcGroupId, 'update', 'group', `Updated group '${data.name}'`, true);
  }

  /**
   * @description Deletes existing group from keycloak
   * @param {String} kcGroupId - The keycloak group id
   */
  async deleteGroup(kcGroupId){
    if ( !this.refreshInterval ){
      await this.refreshInterval();
    }
    await this.client.groups.del({id: kcGroupId});
    this.writeLog(kcGroupId, 'delete', 'group', `Deleted group '${kcGroupId}'`, true);
  }

  /**
   * @description Syncs keycloak group membership with the database
   */
  async syncGroupMembership(){
    await this.getAllGroups();
    await this.getDbGroups();
    await this.getDbGroupMembership();
    await this.getAllUsers();
    for (const userId in this.dbGroupMembershipByUserId) {
      await this.syncGroupMembershipByUser(userId);
    }
  }

  /**
   * @description Syncs keycloak group membership for a single user
   * @param {String} userId - The user id (kerb)
   * @returns 
   */
  async syncGroupMembershipByUser(userId){
    await this.getAllGroups();
    await this.getDbGroups();
    await this.getDbGroupMembership();
    await this.getAllUsers();
    

    if ( !this.users[userId] ){
      this.writeLog(userId, 'update', 'groupMembership', `User ${userId} does not exist in keycloak`, false);
      return;
    }
    const currentUser = this.users[userId];

    // list of local group membership by keycloak group id
    let localGroups = [];
    if ( this.dbGroupMembershipByUserId[userId] ){
      for (const gid of this.dbGroupMembershipByUserId[userId].map(g => g.group_id)) {
        const kcGroup = this.getCachedKcGroup(gid, 'dbId');
        if ( kcGroup ){
          localGroups.push(kcGroup.id);
        }
      }
    }
    

    // list of keycloak group membership by keycloak group id
    let kcGroups = [];
    if ( this.kcGroupMembershipByUser[currentUser.id] ){
      kcGroups = this.kcGroupMembershipByUser[currentUser.id]
    }

    
    // remove from keycloak group if not in local db group
    for (const kcGroupId of kcGroups) {
      if ( !localGroups.includes(kcGroupId) ){
        try {
          await this.client.users.delFromGroup({id: currentUser.id, groupId: kcGroupId});
          this.writeLog(userId, 'delete', 'groupMembership', `Removed user ${userId} from group ${kcGroupId}`, true);
        } catch (error) {
          this.writeLog(userId, 'delete', 'groupMembership', `Error removing user ${userId} from group ${kcGroupId}: ${error.message}`, false)
        }

      } else {
        this.writeLog(userId, 'update', 'groupMembership', `User ${userId} already exists in group ${kcGroupId}`, false);
      }
    }

    // add to keycloak group if in local db group but not in keycloak group
    for (const localGroupId of localGroups) {
      if ( !kcGroups.includes(localGroupId) ){
        await this.client.users.addToGroup({id: currentUser.id, groupId: localGroupId});
        this.writeLog(userId, 'create', 'groupMembership', `Added user ${userId} to group ${localGroupId}`, true);
      }
    }    
  }

  /**
   * @description Syncs all employees from local db with keycloak
   * @param {Boolean} create - create users in keycloak if they don't exist
   */
  async syncEmployees(create=false){

    const onlyUseCache = true;

    const users = await this.getAllUsers();

    // get all employees from local db and sync with keycloak
    const employees = await UcdlibEmployees.getAll();
    if ( employees.err ) throw employees.err;
    for ( const employee of employees.res.rows ){
      this.addEmployeeToCache(employee);
    }
    for ( const employee of employees.res.rows ){
      await this.syncEmployee(employee.user_id, create, false, onlyUseCache)
    }
  }

  // syncs a single user
  async syncEmployee(userId, create=false, remove=false, onlyUseCache=false){
    const logEntity = 'user';
    let user = this.users[userId];
    if ( !this.employees[userId] && onlyUseCache) {
      this.writeLog(userId, 'update', logEntity, 'User not found in employee cache', false);
      return;
    }
    if ( !this.employees[userId] ){
      const employee = await UcdlibEmployees.getById(userId, 'userId');
      if ( employee.err ) throw employee.err;
      if ( !employee.res.rows.length && !remove) {
        this.writeLog(userId, 'delete', logEntity, 'User not found in employee table. Remove flag set to false', false);
        return;
      }
      if ( !employee.res.rows.length && remove && user && user.attributes.dbId) {
        return await this.deleteUser(userId, onlyUseCache);
      }
      this.addEmployeeToCache(employee.res.rows[0]);
    }
    const employee = this.employees[userId];

    // make sure we have the supervisor in the cache
    // need when updating attributes
    const supervisorUserId = this.iamIdToUserId[employee.supervisor_id];
    if ( !supervisorUserId ){
      const supervisor = await UcdlibEmployees.getById(employee.supervisor_id, 'iamId');
      if ( supervisor.err ) throw supervisor.err;
      if ( supervisor.res.rows.length ) {
        this.addEmployeeToCache(supervisor.res.rows[0]);
      }
    }

    if ( !user && onlyUseCache && !create) {
      this.writeLog(userId, 'create', logEntity, 'User not found in keycloak. Create flag is set to false', false);
      return;
    }
    if ( !user ){
      const userQuery = await this.getUsers({username: userId});
      if ( !userQuery.length && !create) {
        this.writeLog(userId, 'create', logEntity, 'User not found in keycloak. Create flag is set to false', false);
        return;
      }
      if ( !userQuery.length && create) {
        return await this.createUser(userId);
      }
      this.users[userId] = userQuery[0];
      user = this.users[userId];
    }
    const {update, attributes} = this.compareAttributes(user, employee, 'user');

    if ( update ) {
      return await this.updateUser(userId, attributes, onlyUseCache);
    }
    this.writeLog(userId, 'update', logEntity, 'User does not require an update', false);

  }

  /**
   * @description Updates a user in keycloak
   * @param {String} userId - Employee user id (kerberos)
   * @param {Object} data - Keycloak user data for put request
   * @param {Boolean} onlyUseCache - If true, only use local cache to determine if user exists
   * @returns 
   */
  async updateUser(userId, data, onlyUseCache=false){
    const logEntity = 'user';
    if ( !this.users[userId] && onlyUseCache) {
      this.writeLog(userId, 'update', logEntity, 'User not found in user cache', false);
      return;
    }
    if ( !this.users[userId] ){
      const user = await this.getUsers({username: userId});
      if ( !user.length ) {
        this.writeLog(userId, 'update', logEntity, 'User not found in keycloak', false);
        return;
      }
      this.users[userId] = user[0];
    }
    let user = this.users[userId];
    if ( !this.refreshInterval ){
      await this.refreshAccessToken();
    }
    const updatedUser = await this.client.users.update({id: user.id}, data);
    this.users[userId] = updatedUser;
    this.writeLog(userId, 'update', logEntity, `Updated user ${userId} in keycloak`, true);
  }

  /**
   * @description Creates a user in keycloak from local db employee
   * @param {String} userId - Employee user id (kerberos)
   * @returns 
   */
  async createUser(userId){
    const employee = this.employees[userId];
    const logEntity = 'user';
    if ( !employee ) {
      this.writeLog(userId, 'create', logEntity, 'User not found in employee cache', false);
      return;
    }

    const attributes = this.userAttributes.map(attribute => this.getUserAttributeValue(attribute, employee));
    const payload = {attributes: {}};
    for (const attribute of attributes) {
      const attributeIsEmpty = !attribute.value && typeof attribute.value !== 'boolean';
      if ( attributeIsEmpty ) continue;
      if ( attribute.topLevel ){
        payload[attribute.kcName] = attribute.value;
      } else {
        payload.attributes[attribute.kcName] = [attribute.value];
      }
    }
    if ( payload.email ){
      payload.emailVerified = true;
    }
    payload.enabled = true;
    payload.username = userId;

    if ( this.config.casIdentityProvider ){
      payload.federatedIdentities = [{
        identityProvider: this.config.casIdentityProvider,
        userId: userId,
        userName: userId
      }]
    }

    if ( !this.refreshInterval ){
      await this.refreshAccessToken();
    }

    let user = await this.client.users.create(payload);
    await this.assignBaseRealmRoles(user.id);
    user = await this.client.users.findOne({id: user.id});
    this.users[userId] = user;
    this.writeLog(userId, 'create', logEntity, `Created user '${userId}' in keycloak`, true);
  }

  /**
   * @description Assigns realm roles from config file to a user
   * @param {String} kcId - Keycloak user id
   * @returns 
   */
  async assignBaseRealmRoles(kcId){
    if ( !this.config.realmRoles || !kcId ) return;
    if ( !this.refreshInterval ){
      await this.refreshAccessToken();
    }
    const roles = [];
    for (let roleName of this.config.realmRoles.split(',')) {
      roleName = roleName.trim();
      if ( !this.realmRolesByName.hasOwnProperty(roleName) ){
        let role = await this.client.roles.findOneByName({
          name: roleName,
        });
        this.realmRolesByName[roleName] = role;
      }
      if (this.realmRolesByName[roleName]){
        roles.push({
          id: this.realmRolesByName[roleName].id,
          name: this.realmRolesByName[roleName].name
        });
      }
    }
    if ( !roles.length ) return;
    await this.client.users.addRealmRoleMappings({id: kcId, roles});
  }

  /**
   * @description Retrieves the value of a keycloak attribute from local employee record
   * @param {Object} attribute - Item from this.userAttributes array
   * @param {Object} employee - Employee object from employee table
   */
  getUserAttributeValue(attribute, employee){
    const out = {...attribute};
    if ( attribute.entity === 'employee' ){
      out.value = employee[attribute.entityProp];
    } else if ( attribute.entity === 'supervisor' ){
      const supervisorUserId = this.iamIdToUserId[employee.supervisor_id];
      if ( !supervisorUserId ) {
        out.value = '';
        return out;
      }
      const supervisor = this.employees[supervisorUserId];
      out.value = supervisor[attribute.entityProp];
    } else {
      out.value = '';
    }
    return out;
  }

  /**
   * @description Retrieves the value of a keycloak attribute from local group record
   * @param {Object} attribute - Item from this.groupAttributes array
   * @param {Object} group - Group object from group table
   * @returns 
   */
  getGroupAttributeValue(attribute, group){
    const out = {...attribute};
    if ( attribute.entity === 'group' ){
      out.value = group[attribute.entityProp];
    } else {
      out.value = '';
    }
    return out;
  }


  /**
   * @description Deletes user from keycloak
   * @param {String} userId - Employee user id (kerberos)
   * @param {Boolean} onlyUseCache - If true, only use local cache to determine if user exists
   * @returns 
   */
  async deleteUser(userId, onlyUseCache=false){
    let kcId;
    if ( !this.users[userId] && onlyUseCache) {
      this.writeLog(userId, 'delete', 'user', 'User not found in user cache', false);
      return;
    }
    if ( !this.users[userId] ){
      const user = await this.getUsers({username: userId});
      if ( !user.length ) {
        this.writeLog(userId, 'delete', 'user', 'User not found in keycloak', false);
        return;
      }
      kcId = user[0].id;
    } else {
      kcId = this.users[userId].id;
    }

    if ( !kcId) {
      this.writeLog(userId, 'delete', 'user', 'Could not determine keycloak user id', false);
      return;
    }
    this.writeLog(userId, 'delete', 'user', `Deleting user ${userId} from keycloak`);

    if ( !this.refreshInterval ){
      await this.refreshAccessToken();
    }

    return this.client.users.del({id: userId});
  }

  /**
   * @description Compares keycloak group or user attributes to respective entry in local database
   * @param {Object} kcEntity - keycloak group or user object
   * @param {*} dbEntity - group or employee object from local database
   * @param {*} entityType - 'group' or 'user'
   * @returns {Object} - {update: true/false, attributes: {attributes: {}}
   */
  compareAttributes(kcEntity, dbEntity, entityType){
    const out = {update: false, attributes: {attributes: {...kcEntity.attributes}}};
    let attributes = [];
    if ( entityType === 'group' ){
      out.attributes.name = kcEntity.name;
      attributes = this.groupAttributes.map(attribute => this.getGroupAttributeValue(attribute, dbEntity));
    } else if ( entityType === 'user' ){
      attributes = this.userAttributes.map(attribute => this.getUserAttributeValue(attribute, dbEntity));
    }
    for (const attribute of attributes) {
      const attributeIsEmpty = !attribute.value && typeof attribute.value !== 'boolean';
      const valueAsString = `${attribute.value}`;
      if ( attribute.topLevel ) {
        if ( kcEntity[attribute.kcName] !== attribute.value ) {
          out.update = true;
          out.attributes[attribute.kcName] = attribute.value;
        }
      }
      else if ( !kcEntity.attributes[attribute.kcName] && attributeIsEmpty){
        continue;
      }
      else if ( kcEntity.attributes[attribute.kcName] && attributeIsEmpty){
        out.update = true;
        delete out.attributes.attributes[attribute.kcName];
      }
      else if ( !kcEntity.attributes[attribute.kcName] || kcEntity.attributes[attribute.kcName][0] !== valueAsString ) {
        out.update = true;
        out.attributes.attributes[attribute.kcName] = [valueAsString];
      }
    }
    return out;
  }

  /**
   * @description Adds an employee to the class cache
   * @param {Object} employee - employee object from employee table
   * @returns 
   */
  addEmployeeToCache(employee){
    if ( !employee.user_id ) return;
    this.employees[employee.user_id] = employee;
    if ( employee.iam_id ) {
      this.userIdToIamId[employee.user_id] = employee.iam_id;
      this.iamIdToUserId[employee.iam_id] = employee.user_id;
    } 
  }

  /**
   * @description Logs an event
   * @param {String} id - id of the entity being acted on
   * @param {String} action - action being taken, from this.actions
   * @param {String} entity - entity being acted on, from this.entities
   * @param {String} message - message to log
   * @param {Boolean} actionTaken - whether the action was taken or not
   */
  writeLog(id, action, entity, message, actionTaken=true){
    if ( !this.logActions.includes(action) ) throw new Error(`Invalid action: ${action}`);
    if ( !this.logEntities.includes(entity) ) throw new Error(`Invalid entity: ${entity}`);
    const l = {id, action, entity, message, actionTaken};
    this.logs.push(l);
    if ( this.logInRealTime ) console.log(l);
  }

  /**
   * @description Prints all logs to the console
   * @param {Boolean} actionTaken - whether to print only logs where actionTaken is true
   */
  printLogs(actionTaken){
    for (const log of this.logs) {
      if ( actionTaken && !log.actionTaken ) continue;
      console.log(log);
    }
  }

  /**
   * @description Prints a summary of all logs to the console
   */
  printLogSummary(){
    const summary = {};
    for (const entity of this.logEntities) {
      summary[entity] = {};
      for (const action of this.logActions) {
        summary[entity][action] = 0;
      }
    }

    for (const log of this.logs) {
      if ( log.actionTaken ) {
        summary[log.entity][log.action]++;
      }
    }
    console.log('The following actions were taken on keycloak entities:')
    console.log(summary);
  }
}

export default new KeycloakAdmin();