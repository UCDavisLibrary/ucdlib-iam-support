import { RT, RTTicket } from '@ucd-lib/rt-api';

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
}

export {
  UcdlibRt,
  UcdlibRtTicket
}
