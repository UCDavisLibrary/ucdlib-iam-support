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

  create(data) {
    return this.service.create(data);
  }

}

const model = new OrgchartModel();
export default model;