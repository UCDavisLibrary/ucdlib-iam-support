import {BaseModel} from '@ucd-lib/cork-app-utils';
import OrgchartService from '../services/OrgchartService.js';
import OrgchartStore from '../stores/OrgchartStore.js';


/**
 * @class OrgchartModel
 * @description SFTP the Orgchart data to files.library
 */
class OrgchartModel extends BaseModel {

  constructor() {
    super();

    this.store = OrgchartStore;
    this.service = OrgchartService;
      
    this.register('OrgchartModel');
  }

  /**
   * @description SFTP Posts the data
   * @returns {Array}
   */
     async orgPush(payload){
      let state = this.store.data.orgchart;
      try {
        if ( state.state === 'loading' ){
          await state.request
        } else {
          await this.service.orgPush(payload);
        }
      } catch(e) {}
      return this.store.data.orgchart;
    }

}

const model = new OrgchartModel();
export default model;