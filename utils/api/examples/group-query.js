import utils from './utils.js';

const params = {
  head: true, // include the head of the group
  //members: true, // include the members of the group
  //parent: true, // include the parent of the group
  //children: true, // include the children of the group
  //'filter-id': '22', // comma separated list of group ids
  'filter-active': true, // only include active groups
  //'filter-archived': true, // only include archived groups
  //'filter-group-type': '2', // comma separated list of group types
  'filter-part-of-org': true, // only include groups that are part of the official org structure
  //'filter-not-part-of-org': true // only include groups that are not part of the official org structure

};
const url = utils.url('groups', params)
utils.get(url);
