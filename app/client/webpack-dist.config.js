const path = require('path');
const fs = require('fs-extra');
const buildConfig = require('./build-config');

let dist = `${buildConfig.publicDir}/js/dist`;
let distFolder = path.join(__dirname, dist);
if( fs.existsSync(distFolder) ) {
  fs.removeSync(distFolder);
}

let config = require('@ucd-lib/cork-app-build').dist({
  // root directory, all paths below will be relative to root
  root : __dirname,
  // path to your entry .js file
  entry : buildConfig.entry,
  dist: distFolder,
  modern : buildConfig.fileName,
  ie: `${buildConfig.fileName.split(".")[0]}-ie.js`,
  clientModules : buildConfig.clientModules
});


if( !Array.isArray(config) ) config = [config];
config.forEach(conf => {
});

module.exports = config;