import KcAdminClient from '@keycloak/keycloak-admin-client';
import UcdlibEmployees from "./employees.js";
import UcdlibGroups from "./groups.js";
import {Issuer} from 'openid-client';

class KeycloakAdmin{

  constructor(){
    this.config = {};

    this.logActions = ['create', 'update', 'delete'];
    this.logEntities = ['user', 'group'];
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
    this.groupAttributes = [
      {kcName: 'name', topLevel: true, entity: 'group', entityProp: 'name'},
      {kcName: 'dbId', entity: 'group', entityProp: 'id'},
    ]
    this.resetState();
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
   * @description Resets class state properties such as logs and caches
   */
  resetState(){
    this.users = {};
    this.employees = {};
    this.kcGroups = [];
    this.dbGroups = [];
    this.kcGroupMembershipByUser = {};
    this.userIdToIamId = {};
    this.iamIdToUserId = {};
    this.logs = [];
    this.logInRealTime = false;
    this.stopRefreshInterval();
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

  async getActiveDbGroups(){
    if ( this.dbGroups.length ) return this.dbGroups;
    const groups = await UcdlibGroups.getAll();
    if ( groups.err ) throw groups.err;
    this.dbGroups = groups.res.rows.filter(g => !g.archived);
    return this.dbGroups;
  }

  /**
   * @description Gets all groups from keycloak or cache
   * @returns 
   */
  async getAllGroups(){
    if ( this.kcGroups.length ) return this.kcGroups;
    const groups = await this.getGroups();
    
    // get more detailed group info
    for (const group of groups) {
      if ( !this.refreshInterval ){
        await this.refreshAccessToken();
      }
      let g = await this.client.groups.findOne({id: group.id});
      g.members = await this.client.groups.listMembers({id: group.id});
      for ( const m of g.members ) {
        if ( !this.kcGroupMembershipByUser[m.id] ){
          this.kcGroupMembershipByUser[m.id] = [];
        }
        this.kcGroupMembershipByUser[m.id].push(g.id);
      }
      this.kcGroups.push(g);
    }
    return this.kcGroups;
  }

  /**
   * @description Gets a keycloak group from the class cache
   * @param {String} id - The id of the group
   * @param {String} idType - The type of id, either kcId or dbId
   * @returns 
   */
  getCachedKcGroup(id, idType='kcId'){
    if ( idType === 'kcId' ){
      return this.kcGroups.find(g => g.id === id);
    } else if ( idType === 'dbId' ){
      return this.kcGroups.find(g => g.attributes.dbId === id);
    }
  }

  // syncs keycloak users and groups with local database
  // updates properties of existing users and groups
  // creates new groups
  // DOES NOT create or delete existing keycloak users
  async syncAll(createUsers=false, removeUsers=false){
    await this.syncEmployees(createUsers, removeUsers);
  }

  async syncGroups(){
    await this.getAllGroups();
    await this.getActiveDbGroups();
    for ( const dbGroup of this.dbGroups ){
      let kcGroup = this.getCachedKcGroup(dbGroup.id, 'dbId');
      if ( !kcGroup ){
        await this.createGroup(dbGroup);
      } else {
        //await this.updateGroup(dbGroup, kcGroup);
      }
    }
  }

  async createGroup(dbGroup){
    if ( !this.refreshInterval ){
      await this.refreshAccessToken();
    }
    const attributes = this.groupAttributes.map(attribute => this.getGroupAttributeValue(attribute, dbGroup));
    const payload = {attributes: {}};
    for (const attribute of attributes) {
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
    this.writeLog(dbGroup.id, 'create', 'group', `Created group ${group.name}`, true);
  }

  async syncGroupMembershipByGroup(){}

  async syncGroupMembershipByUser(){}

  /**
   * @description Syncs all employees from local db with keycloak
   * @param {Boolean} create - create users in keycloak if they don't exist
   * @param {Boolean} remove - remove users from keycloak if they don't exist in local db
   */
  async syncEmployees(create=false, remove=false){

    const onlyUseCache = true;

    // get all keycloak users
    const users = await this.getUsers();
    for (const user of users) {
      this.users[user.username] = user;
    }

    // get all employees from local db and sync with keycloak
    const employees = await UcdlibEmployees.getAll();
    if ( employees.err ) throw employees.err;
    for ( const employee of employees.res.rows ){
      this.addEmployeeToCache(employee);
    }
    for ( const employee of employees.res.rows ){
      await this.syncEmployee(employee.user_id, create, remove, onlyUseCache)
    }
  }

  // syncs a single user
  async syncEmployee(userId, create=false, remove=false, onlyUseCache=false){
    const logEntity = 'user';
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
      if ( !employee.res.rows.length && remove) {
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

    if ( !this.users[userId] && onlyUseCache && !create) {
      this.writeLog(userId, 'create', logEntity, 'User not found in keycloak. Create flag is set to false', false);
      return;
    }
    if ( !this.users[userId] ){
      const user = await this.getUsers({username: userId});
      if ( !user.length && !create) {
        this.writeLog(userId, 'create', logEntity, 'User not found in keycloak. Create flag is set to false', false);
        return;
      }
      if ( !user.length && create) {
        return await this.createUser(userId);
      }
      this.users[userId] = user[0];
    }
    const user = this.users[userId];
    const {update, attributes} = this.compareAttributes(user, employee);

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

  async createUser(userId){
    // todo - create user
  }

  /**
   * @description Compares keycloak user attributes to employee attributes
   * @param {Object} user - keycloak user object
   * @param {Object} employee - employee object from employee table
   * @returns {Object} - {update: true/false, userData: {attributes: {}}}
   */
  compareAttributes(user, employee){
    const out = {update: false, attributes: {attributes: {...user.attributes}}};
    const attributes = this.userAttributes.map(attribute => this.getUserAttributeValue(attribute, employee));
    for (const attribute of attributes) {
      if ( attribute.topLevel ) {
        if ( user[attribute.kcName] !== attribute.value ) {
          out.update = true;
          out.attributes[attribute.kcName] = attribute.value;
        }
      }
      else if ( !user.attributes[attribute.kcName] || user.attributes[attribute.kcName][0] !== attribute.value ) {
        out.update = true;
        out.attributes.attributes[attribute.kcName] = [attribute.value];
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