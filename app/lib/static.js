import path from 'path';
import spaMiddleware from '@ucd-lib/spa-router-middleware';
import config from './config.js';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default (app) => {
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
        appRoutes : config.routes,
        keycloak: config.keycloak,
        version: config.version
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
