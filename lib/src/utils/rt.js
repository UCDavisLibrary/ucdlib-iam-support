import { RT, RTTicket } from '@ucd-lib/rt-api';
import UcdlibGroups from "./groups.js";

class UcdlibRt {

  /**
   *
   * @param {Object} config - RT config obect from AppConfig class
   */
  constructor(config){
    this.config = config;
    this.client = new RT({host: config.url, token: config.key});
    this.forbidWrite = config.forbidWrite;
  }

  async createTicket(ticket){
    if ( !ticket.queue ){
      ticket.queue = this.config.queue;
    }
    const out = {res: false, err: false};

    if ( this.forbidWrite ){
      out.res = {id: this._makeFakeTicketId(), isFake: true};
      return out;
    }
    try {
      const response = await this.client.createTicket(ticket);
      if ( !response.ok ){
        throw new Error(`HTTP Error Response: ${response.status} ${response.statusText}`);
      }
      out.res = await response.json();
    } catch (error) {
      out.err = error
    }
    return out;
  }

  async sendCorrespondence(correspondence){
    const out = {res: false, err: false};
    if ( this.forbidWrite || correspondence.ticketId.startsWith('fake-') ){
      out.res = [correspondence.type == 'reply' ? 'Correspondence added' : 'Comments added'];
      return out;
    }
    try {
      const response = await this.client.sendCorrespondence(correspondence);
      if ( !response.ok ){
        throw new Error(`HTTP Error Response: ${response.status} ${response.statusText}`);
      }
      out.res = await response.json();
    } catch (error) {
      out.err = error
    }
    return out;
  }

  async getTicketHistory(ticket, searchParams){
    const out = {res: false, err: false};
    if ( !ticket || ticket.startsWith('fake-') ){
      out.res = {items: []};
      return out;
    }
    try {
      const response = await this.client.getTicketHistory(ticket, searchParams);
      if ( !response.ok ){
        throw new Error(`HTTP Error Response: ${response.status} ${response.statusText}`);
      }
      out.res = await response.json();
    } catch (error) {
      out.err = error
    }
    return out;

  }

  async getLastStatusChange(ticketId){
    const params = {
      fields: 'Type,OldValue,NewValue,Field,Created,Creator,Data',
      'fields[Creator]': 'Name,id,RealName',
      per_page: 100
    }
    const history = await this.getTicketHistory(ticketId, params);
    if ( history.err ) return history;
    history.res.items.reverse();
    return {res: history.res.items.find(item => item.Type == 'Status' && item.OldValue != item.NewValue)};
  }

  _makeFakeTicketId(){
    const min = 0;
    const max = 100000;
    const n = Math.floor(Math.random() * (max - min) + min);
    return `fake-${n}`;
  }
}

class UcdlibRtTicket extends RTTicket {

  /**
   *
   * @param {Object} config - RT config obect from AppConfig class
   * @param {Object} data - Optional. Directly set the request body
   */
  constructor(config, data){
    super(data);
  }

  /**
   * @description Add the employee info from onboarding request to the body of ticket
   * @param {Object} request - Onboarding request object
   * @returns
   */
  addOnboardingEmployeeInfo(request){
    if ( !request ) return;
    const ad = request.additional_data || request.additionalData || {};
    const employeeName = `${ad.employeeLastName || ''}, ${ad.employeeFirstName || ''}`;
    this.addContent(`<h4>Employee</h4>`);
    this.addContent({
      'Name': employeeName,
      'Email': ad.employeeEmail || '????',
      'Employee Id': ad.employeeId || '????',
      'User Id (kerberos)': ad.employeeUserId || '????',
      'UCD IAM ID': request.iamId || request.iam_id || '????'
    }, false);
  }

  /**
   * @description Add the position info from onboarding request to the body of ticket
   * @param {Object} request - Onboarding request object
   * @returns
   */
  async addOnboardingPositionInfo(request){
    if ( !request ) return;
    let department =  await UcdlibGroups.getDepartmentsById(request.groupIds || request.group_ids || []);
    department = department.res && department.res.rows.length ? department.res.rows[0].name : '????';
    const ad = request.additional_data || request.additionalData || {};
    let startDate = request.startDate || request.start_date || '????';
    if ( typeof startDate?.toISOString === 'function' ) {
      startDate = startDate.toISOString().split('T')[0];
    }

    this.addContent(`<h4>Position</h4>`);
    this.addContent({
      'Title': request.libraryTitle || request.library_title || '????',
      'Department': department,
      'Supervisor': `${ad.supervisorLastName}, ${ad.supervisorFirstName}`,
      'Supervisor Email': ad.supervisorEmail || '????',
      'Start Date': startDate
    }, false);
  }
}

export {
  UcdlibRt,
  UcdlibRtTicket
}
