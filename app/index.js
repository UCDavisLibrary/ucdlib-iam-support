import express from 'express';
import setUpApiRoutes from "./api/index.js"
import setUpStaticRoutes from './lib/static.js';

const app = express();

app.use(express.json());

// setup api routes
setUpApiRoutes(app);

// setup static app routes including spa
setUpStaticRoutes(app);

app.listen(3000, () => {
  console.log('server ready on port 3000');
});
