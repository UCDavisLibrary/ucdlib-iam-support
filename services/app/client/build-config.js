const config = {
  fileName: 'ucdlib-iam-support.js',
  entry: './src/elements/ucdlib-iam-app.js',
  publicDir: 'public',
  clientModules: [
    'node_modules',
  ],
  loaderOptions: {
    css: {
      loader: 'css-loader',
      options : {
        url: false
      }
    },
    scss: {
      loader: 'sass-loader',
      options: {
        implementation: require("sass"),
        sassOptions: {
          includePaths: [
            "node_modules/@ucd-lib/theme-sass",
            "node_modules/breakpoint-sass/stylesheets",
            "node_modules/sass-toolkit/stylesheets"]
        }
      }
    }
  },
};

module.exports = config;