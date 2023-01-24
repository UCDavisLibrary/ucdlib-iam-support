const path = require('path');
const spaMiddleware = require('@ucd-lib/spa-router-middleware');
const config = require('./config');

module.exports = (app) => {
  let assetsDir = path.join(__dirname, '../client/public');

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
      next({title: config.title});
    }
  });

}