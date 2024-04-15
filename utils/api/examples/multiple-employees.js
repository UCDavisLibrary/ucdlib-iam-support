import utils from './utils.js';

/**
 * Get a set of employees by passing a comma separated list of identifiers
 * Not designed to be used with a large number of employees
 */
const params = {
  'id-type': 'email',
  groups: true,
  supervisor: true,
  'department-head': true
};
const url = utils.url('employees/spelkey@ucdavis.edu,mjwarren@ucdavis.edu', params)
utils.get(url);
