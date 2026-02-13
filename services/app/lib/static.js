import path from 'path';
import spaMiddleware from '@ucd-lib/spa-router-middleware';
import { fileURLToPath } from 'url';

import config from '#lib/utils/config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default (app) => {
  let assetsDir = path.join(__dirname, '../client/public');
  const bundle = `
    <link rel="stylesheet" href="/css/${config.env == 'dev' ? 'dev' : 'dist'}/${config.app.stylesheetName}?v=${config.version}">
    <script src='/js/${config.env == 'dev' ? 'dev' : 'dist'}/${config.app.bundleName}?v=${config.version}' defer></script>
  `;

  spaMiddleware({
    app,
    htmlFile : path.join(assetsDir, 'index.html'),
    isRoot : true,
    appRoutes : config.app.routes,
    static : {
      dir : assetsDir
    },
    enable404 : false,

    getConfig : async (req, res, next) => {
      next({
        appRoutes : config.app.routes,
        keycloak: config.keycloak,
        version: config.version,
        logger: config.logger
      });
    },

    template : (req, res, next) => {
      next({
        title: config.app.title,
        bundle
      });
    }
  });

}
