import express from 'express';
import config from "#lib/utils/config.js";

import routes from './routes/index.js';

const app = express();
app.use(express.json());

routes(app);

app.listen(3000, () => {
  console.log('server ready on port 3000');

  if ( config.api.hostPort ) {
    console.log('publishing to port: ', config.api.hostPort);
  }

});
