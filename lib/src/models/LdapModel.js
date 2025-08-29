import {BaseModel} from '@ucd-lib/cork-app-utils';
import LdapService from '../services/LdapService.js';
import LdapStore from '../stores/LdapStore.js';


/**
 * @class LdapModel
 * @description SFTP the LDAP data to receive data
 */
class LdapModel extends BaseModel {

  constructor() {
    super();

    this.store = LdapStore;
    this.service = LdapService;
      
    this.register('LdapModel');
  }

  /**
   * @description SFTP GETs the data
   * @returns {Array}
   */
    async getLdapData(query){
      let state = this.store.data.ldap
      
      try {
        if ( state.state === 'loading' ){
          await state.request
        } else {
          await this.service.getLdapData(query);
        }
      } catch(e) {}

    
      return this.store.data.ldap;
    }


  /**
   * @description Clears cache for ldap id
   */
  clearLdapCache(){
    this.store.data.ldap = {};

  }

}

const model = new LdapModel();
export default model;