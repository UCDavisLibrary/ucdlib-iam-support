import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import config from "#lib/utils/config.js";
import MiniCssExtractPlugin from 'mini-css-extract-plugin';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class WebpackUtils {

  constructor(){
    this.publicDir = path.join(__dirname, '../public');
    this.root = __dirname;
    this.entry = path.join(__dirname, '../src/elements/ucdlib-iam-app.js');
    this.scssEntry = path.join(__dirname, '../scss/style.scss');
    this.bundleName = config.app.bundleName;
    this.stylesheetName = config.app.stylesheetName;
    this.clientModules = [];
  }

  jsDir(isDist){
    return path.join(this.publicDir, 'js', isDist ? 'dist' : 'dev');
  }

  cssDir(isDist){
    return path.join(this.publicDir, 'css', isDist ? 'dist' : 'dev');
  }

  removeCssDir(isDist){
    const cssDir = this.cssDir(isDist);
    if (fs.existsSync(cssDir)) {
      fs.rmSync(cssDir, { recursive: true, force: true });
    }
  }

  removeJsDir(isDist){
    const jsDir = this.jsDir(isDist);
    if (fs.existsSync(jsDir)) {
      fs.rmSync(jsDir, { recursive: true, force: true });
    }
  }

  addCssLoader(conf){
    let cssModule = conf.module.rules.find(rule => {
    if( !Array.isArray(rule.use) ) return false;
      return rule.use.includes('css-loader');
    });

    let mindex = cssModule.use.indexOf('css-loader');
    cssModule.use[mindex] = {
      loader: 'css-loader',
      options: {
        url : false
      }
    }
  }

  addScssLoader(conf, isDist){
    if( !Array.isArray(conf.entry) ) conf.entry = [conf.entry];
    conf.entry.push(this.scssEntry);
    conf.module.rules.push({
      test: /\.s[ac]ss$/i,
      use: [
        { loader: MiniCssExtractPlugin.loader},
        { loader: 'css-loader', options : {url: false} },
        {
          loader: 'sass-loader',
          options: {
            sassOptions: {
              includePaths: [
                path.join(__dirname, "../../../node_modules/@ucd-lib/theme-sass"),
                path.join(__dirname, "../../../node_modules/breakpoint-sass/stylesheets"),
                path.join(__dirname, "../../../node_modules/sass-toolkit/stylesheets")]
            }
          }
        }
      ]
    });

    conf.plugins = [
      new MiniCssExtractPlugin({
        filename: `../../css/${isDist ? 'dist' : 'dev'}/${this.stylesheetName}`
      })
    ];
  }

}

export default new WebpackUtils();
