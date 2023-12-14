import utils from './utils.js';

const params = {
  'id-type': 'email',
  members: true
};
const url = utils.url('groups/member/spelkey@ucdavis.edu', params)
utils.get(url);
