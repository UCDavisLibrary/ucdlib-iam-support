import KcAdminClient from '@keycloak/keycloak-admin-client';
import UcdlibEmployees from "./employees.js";
import {Issuer} from 'openid-client';

class KeycloakAdmin{

  constructor(){
    this.config = {};

    this.logActions = ['create', 'update', 'delete'];
    this.logEntities = ['user', 'group'];
    this.resetState();
  }

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
      setInterval(() => this.refreshAccessToken(), config.refreshInterval);
    }
  }

  resetState(){
    this.users = {};
    this.employees = {};
    this.logs = [];
    this.logInRealTime = false;
  }

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

  // https://www.keycloak.org/docs-api/11.0/rest-api/index.html#_users_resource
  async getUsers(query={}){
    if ( !this.config.refreshInterval ){
      await this.refreshAccessToken();
    }
    return await this.client.users.find(query);
  }

  // syncs keycloak users and groups with local database
  // updates properties of existing users and groups
  // creates new groups
  // DOES NOT create or delete existing keycloak users
  async syncAll(createUsers=false, removeUsers=false){
    await this.syncEmployees(createUsers, removeUsers);
  }

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
      this.employees[employee.user_id] = employee;
      this.syncEmployee(employee.user_id, create, remove, onlyUseCache)
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
      this.employees[userId] = employee.res.rows[0];
    }
    const employee = this.employees[userId];

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
        return await this.createUser(userId, onlyUseCache);
      }
      this.users[userId] = user[0];
    }
    const user = this.users[userId];
    this.writeLog(userId, 'update', logEntity, 'should be sabrina and i', true);
  }

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

    return this.client.users.del({id: userId});
  }

  async createUser(userId, onlyUseCache=false){
    // todo - create user
  }

  writeLog(id, action, entity, message, actionTaken=true){
    if ( !this.logActions.includes(action) ) throw new Error(`Invalid action: ${action}`);
    if ( !this.logEntities.includes(entity) ) throw new Error(`Invalid entity: ${entity}`);
    const l = {id, action, entity, message, actionTaken};
    this.logs.push(l);
    if ( this.logInRealTime ) console.log(l);
  }

  printLogs(actionTaken){
    for (const log of this.logs) {
      if ( actionTaken && !log.actionTaken ) continue;
      console.log(log);
    }
  }

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