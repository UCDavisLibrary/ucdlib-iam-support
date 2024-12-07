import utils from './utils.js';

const params = {};

const url = utils.url('active-titles', params)
utils.get(url);
