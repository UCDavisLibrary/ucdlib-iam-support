import { RT, RTTicket } from '@ucd-lib/rt-api';

class UcdlibRt {

  /**
   * 
   * @param {Object} config - RT config obect from AppConfig class
   */
  constructor(config){
    this.client = new RT({host: config.url, token: config.key});
    this.forbidWrite = config.forbidWrite;
  }

  async createTicket(ticket){
    const out = {res: false, err: false};
    try {
      const response = await this.client.createTicket(ticket);
      out.res = await response.json();
    } catch (error) {
      out.err = error
    }
    return out;
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
    this.queue = config.queue;
  }
}

export {
  UcdlibRt,
  UcdlibRtTicket
}
