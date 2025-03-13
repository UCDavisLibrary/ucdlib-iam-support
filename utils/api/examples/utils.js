import 'dotenv/config';
import fetch from 'node-fetch';
import headers from './auth.js';
import util from 'util';

class utils {

  constructor(){

    this._url = process.env.URL || 'http://localhost:3002';
  }

  url(path, params={}){
    params = new URLSearchParams(params);
    path = path.replace(/^\//, '');
    const urlParams = params.toString();
    let url = `${this._url}/json/${path}`;
    if(urlParams){
      url = `${url}?${urlParams}`;
    }
    return url;
  }

  log(msg){
    console.log(util.inspect(msg, { showHidden: false, depth: null, colors: true }));
  }

  async get(url){
    console.log(url);
    const res = await fetch(url, {headers});
    const json = await res.json();
    this.log(json);
    return json;
  }

}

export default new utils();
