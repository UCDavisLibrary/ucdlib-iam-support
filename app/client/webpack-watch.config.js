const path = require('path');
const fs = require('fs-extra');
const buildConfig = require('./build-config');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

let preview = `${buildConfig.publicDir}/js/dev`;
let previewFolder = path.join(__dirname, preview);
if( fs.existsSync(previewFolder) ) {
  fs.removeSync(previewFolder);
}

let config = require('@ucd-lib/cork-app-build').watch({
  // root directory, all paths below will be relative to root
  root : __dirname,
  // path to your entry .js file
  entry : buildConfig.entry,
  // folder where bundle.js will be written
  preview : preview,
  modern : buildConfig.fileName,
  clientModules : buildConfig.clientModules
});

if( !Array.isArray(config) ) config = [config];

config.forEach(conf => {

  // make stylesheet
  if( !Array.isArray(conf.entry) ) conf.entry = [conf.entry]; 
  conf.entry.push(path.join(__dirname, './scss/style.scss'));
  conf.module.rules.push({
    test: /\.s[ac]ss$/i,
    use: [
      { loader: MiniCssExtractPlugin.loader},
      buildConfig.loaderOptions.css,
      buildConfig.loaderOptions.scss,
    ]
  });

  conf.plugins = [
    new MiniCssExtractPlugin({
      filename: '../../css/site.css'
    })
  ];
});


module.exports = config;