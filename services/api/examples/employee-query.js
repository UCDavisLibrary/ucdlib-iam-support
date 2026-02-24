import utils from './utils.js';

/**
 * Query for a set of employees
 */
let params = {
  name: 'snapp', // employee name
  //department: '19', // comma separated list of department ids
  //'title-code': '000667', // comma separated list of title codes
};
//params = {'title-code': '000652,007299,007300'}
const url = utils.url('employees', params)
utils.get(url);
