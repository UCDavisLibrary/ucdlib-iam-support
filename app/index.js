const express = require('express');
const app = express();

// setup api routes
require('./api')(app);

// setup static app routes including spa
require('./lib/static')(app);

app.listen(3000, () => {
  console.log('server ready on port 3000');
});