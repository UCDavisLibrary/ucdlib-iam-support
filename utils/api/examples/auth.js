import 'dotenv/config';

// basic auth
const username = process.env.BASIC_AUTH_USERNAME;
const password = process.env.BASIC_AUTH_PASSWORD;
if ( !username || !password ) {
  throw new Error('Missing BASIC_AUTH_USERNAME or BASIC_AUTH_PASSWORD env var');
}
const auth = Buffer.from(`${username}:${password}`).toString('base64');

const headers = {
  'Authorization': `Basic ${auth}`
};

export default headers;
