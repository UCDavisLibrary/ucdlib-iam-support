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
    if ( this.resourceAccessRoles.length ) return true;
    return false;
  }

  get canCreateRequests(){
    if ( this.hasAdminAccess ) return true;
    if ( this.hasHrAccess ) return true;
    if ( this._inRoleList('create-requests', 'resource') ) return true;
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

    if ( accessType.includes('realm') && this.realmAccessRoles.includes(role) ) return true;

    if ( accessType.includes('resource') && this.resourceAccessRoles.includes(role) ) return true;

    return false;
  }

  get resourceAccessRoles(){
    if ( 
      this.token.resource_access && 
      this.token.resource_access[this.client] && 
      this.token.resource_access[this.client].roles )
      { 
        return this.token.resource_access[this.client].roles;
      }
    return [];
  }

  get realmAccessRoles(){
    if ( this.token.realm_access && this.token.realm_access.roles ){
      return this.token.realm_access.roles;
    }
    return [];
  }

  get id(){
    return this.token.preferred_username || '';  
  }

  get iamId(){
    return this.token.iamId || '';
  }

  get email(){
    return this.token.email || '';
  }
}