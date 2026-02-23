import {BaseModel} from '@ucd-lib/cork-app-utils';
import LdapService from '../services/LdapService.js';
import LdapStore from '../stores/LdapStore.js';


/**
 * @class LdapModel
 * @description Retrieval for the LDAP data
 */
class LdapModel extends BaseModel {

  constructor() {
    super();

    this.store = LdapStore;
    this.service = LdapService;
      
    this.register('LdapModel');
  }

  /**
   * @description LDAP queries the data
   * @returns {Array}
   */
  query(query){
    return this.service.query(query);
  }

}

const model = new LdapModel();
export default model;