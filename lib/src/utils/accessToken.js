/**
 * @description Class for accessing properties of an access token for this client
 * publish to npm so other projects can inherit this class
 */
export default class AccessToken {
  constructor(token={}, client='iam-client'){
    this.token = token;
    this.client = client;
    this.isEmpty = Object.keys(this.token).length == 0;
  }

  get hasAccess(){
    if ( this.hasAdminAccess ) return true;
    if ( this.hasBasicAccess ) return true;
    return false;
  }

  get hasBasicAccess(){
    return this._inRoleList('basic-access');
  }

  get hasAdminAccess(){
    return this._inRoleList('admin-access');
  }

  get hasStudentAssistantAccess(){
    return this._inRoleList('student-assistant-access');
  }

  get hasHrAccess(){
    return this._inRoleList('hr-access', 'resource');
  }

  _inRoleList(role, accessType=['realm', 'resource']){
    if ( typeof accessType === 'string') accessType = [accessType];

    if ( accessType.includes('realm') ){
      if ( this.token.realm_access && this.token.realm_access.roles ){
        if ( this.token.realm_access.roles.includes(role) ) return true;
      }
    }

    if ( accessType.includes('resource') ){
      if ( 
        this.token.resource_access && 
        this.token.resource_access[this.client] &&
        this.token.resource_access[this.client].roles
        ) {
          if ( this.token.resource_access[this.client].roles.includes(role) ) return true;
        }
    }

    return false;
  }

  get id(){
    return this.token.preferred_username || '';  
  }

  get iamId(){
    return this.token.iamId || '';
  }
}