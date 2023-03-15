import {BaseModel} from '@ucd-lib/cork-app-utils';
import RtService from '../services/RtService.js';
import RtStore from '../stores/RtStore.js';

class RtModel extends BaseModel {

  constructor() {
    super();

    this.store = RtStore;
    this.service = RtService;
      
    this.register('RtModel');
  }

  /**
   * @description Get ticket transaction history
   * @param {String} id RT ticket id
   * @returns 
   */
  async getHistory(id) {
    let state = this.store.data.history[id];
    try {
      if( state && state.state === 'loading' ) {
        await state.request;
      } else {
        await this.service.getHistory(id);
      }
    } catch(e) {}
    return this.store.data.history[id];
  }

  /**
   * @description Formats ticket history items into a brief text blurb
   * @param {Array} history - transaction items from getHistory method
   * @returns {Array} [{text: foo, created: datestring}]
   */
  formatHistory(history){
    const out = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (const trans of history) {
      const item = {};
      const name = trans.Creator ? trans.Creator.RealName || trans.Creator.Name || '' : '';
      if ( trans.Created ) {
        const d = new Date(trans.Created);
        item.created = `${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()} ${d.toLocaleTimeString()}`;
      }
      if ( trans.Type === 'Create' ) {
        item.text = `Created by ${name}`;
      } else if ( trans.Type === 'Correspond' ){
        item.text = `Correspondence added by ${name}`;
      } else if (trans.Type === 'Status' ){
        item.text = `Status changed to ${trans.NewValue} by ${name}`
      } else {
        continue;
      }
      out.push(item);
    }
    return out;
  }

}

const model = new RtModel();
export default model;