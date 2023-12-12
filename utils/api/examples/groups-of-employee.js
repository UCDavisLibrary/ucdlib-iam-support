import fetch from 'node-fetch';
import util from 'util';
import 'dotenv/config'

const url = 'http://localhost:3001/json/groups/member/spelkey@ucdavis.edu?id-type=email&members=true';

// basic auth
const username = process.env.BASIC_AUTH_USERNAME;
const password = process.env.BASIC_AUTH_PASSWORD;
const auth = Buffer.from(`${username}:${password}`).toString('base64');

const headers = {
  'Authorization': `Basic ${auth}`
};

const fetchGroups = async () => {
  const res = await fetch(url, {headers});
  const json = await res.json();
  return json;
}

fetchGroups().then(groups => {
  console.log(util.inspect(groups, { showHidden: false, depth: null, colors: true }));
});
