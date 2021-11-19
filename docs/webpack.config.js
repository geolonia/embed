const config = require('../webpack.config')

module.exports = {
  ...config,
  output: {
    ...config.output,
    path: __dirname,
    filename: 'embed'
  },
  mode: 'development',
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: __dirname
    },
    open: true,
    port: 3000,
  },
}
