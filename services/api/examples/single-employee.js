import utils from './utils.js';

const params = {
  'id-type': 'email',
  groups: true,
  supervisor: true,
  'department-head': true
};
const url = utils.url('employees/spelkey@ucdavis.edu', params)
utils.get(url);
