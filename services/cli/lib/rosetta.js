import utils from './utils.js';
import rosetta from '#lib/utils/rosetta.js';

class RosettaCli {

  async get(id, options){
    const r = await rosetta.getPeople({ [options.idtype]: id, limit: 1 });
    if ( r.results.length === 0 ) {
      console.log(`No record found in Rosetta for ${options.idtype} '${id}'`);
      return;
    }
    utils.logObject(r.results[0]);
  }

  async search(name, options){
    const query = {};
    if ( options.limit ) query.limit = options.limit;

    let firstName, lastName;

    if ( options.field === 'last'){
      lastName = name.trim();
    } else if ( options.field === 'first' ) {
      firstName = name.trim();
    } else if ( options.field === 'full' ) {
      const parts = name.split(',');
      if ( parts.length < 2 ) {
        console.log('When using the "full" field, please provide the last name first, followed by a comma, and then the first name');
        return;
      }
      lastName = parts[0].trim();
      firstName = parts[1].trim();
    }

    if ( !lastName && !firstName ) {
      console.log('Please provide a name to search');
      return;
    }

    for ( const param of [{v: lastName, k: 'lastname'}, {v: firstName, k: 'firstname'}] ) {
      if ( param.v ) {
        query[`${param.k}${options.partial ? 'like' : ''}`] = param.v;
      }
    }

    const r = await rosetta.getPeople(query);
    if ( r.results.length === 0 ) {
      console.log(`No records found in Rosetta for ${options.field} name: '${name}'`);
      return;
    }
    utils.logObject(r.results);
  }

}

export default new RosettaCli();