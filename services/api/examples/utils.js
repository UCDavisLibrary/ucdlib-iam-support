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
    console.log('url:', url);
    console.log('headers:', headers);
    const res = await fetch(url, {headers});
    console.log('status:', res.status);
    const content = await this.parseContent(res);
    this.log(content);
  }

  async parseContent(res){
    let content = null;
    try {
      content = await res.json();
    } catch (err) {
      console.warn('Failed to parse JSON, trying text:', err);
      try {
        content = await res.text();
      } catch (err) {
        console.error('Failed to parse text:', err);
        content = null;
      }
    }
    return content;
  }
}

export default new utils();
