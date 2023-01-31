const path = require('path');
const spaMiddleware = require('@ucd-lib/spa-router-middleware');
const config = require('./config');

module.exports = (app) => {
  let assetsDir = path.join(__dirname, '../client/public');
  const bundle = `
    <link rel="stylesheet" href="/css/site.css?v=${config.version}">
    <script src='/js/${config.env == 'dev' ? 'dev' : 'dist'}/ucdlib-iam-support.js?v=${config.version}'></script>
  `;

  spaMiddleware({
    app, 
    htmlFile : path.join(assetsDir, 'index.html'), 
    isRoot : true, 
    appRoutes : config.routes, 
    static : {
      dir : assetsDir
    },
    enable404 : false,

    getConfig : async (req, res, next) => {
      next({
        appRoutes : config.routes
      });
    },
    
    template : (req, res, next) => {
      next({
        title: config.title,
        bundle
      });
    }
  });

}