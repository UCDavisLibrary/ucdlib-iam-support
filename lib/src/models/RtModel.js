import {BaseModel} from '@ucd-lib/cork-app-utils';
import RtService from '../services/RtService.js';
import RtStore from '../stores/RtStore.js';
import DtUtils from "../utils/dtUtils.js"

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
    this.store.emit(this.store.events.RT_TICKET_HISTORY_REQUEST, this.store.data.history[id]);
    return this.store.data.history[id];
  }

  /**
   * @description Clears cache for transaction history.
   * @param {String} id - RT ticket id - if excluded, will clear cache for all tickets
   */
  clearHistoryCache(id){
    if ( id ){
      if ( this.store.data.history[id] ){
        delete this.store.data.history[id];
      }
    } else {
      this.store.data.history = {};
    }
  }

  /**
   * @description Formats ticket history items into a brief text blurb
   * @param {Array} history - transaction items from getHistory method
   * @returns {Array} [{text: foo, created: datestring}]
   */
  formatHistory(history){
    const out = [];
    for (const trans of history) {
      const item = {};
      const name = trans.Creator ? trans.Creator.RealName || trans.Creator.Name || '' : '';
      if ( trans.Created ) {
        item.created = DtUtils.fmtDatetime(trans.Created);
      }
      if ( trans.Type === 'Create' ) {
        item.text = `Created by ${name}`;
      } else if ( trans.Type === 'Correspond' && trans.Data.startsWith('Permissions Request') ){
        item.text = `Permissions request submitted`;
      } else if ( trans.Type === 'Correspond' && trans.Data.startsWith('Onboarding Record Reconciled') ){
        item.text = `Record reconciled`;
      } else if ( trans.Type === 'Correspond' && trans.Data.startsWith('Employee Record Added') ){
        item.text = `Employee record added to Library IAM system`;
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
