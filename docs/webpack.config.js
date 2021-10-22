const path = require('path')
const config = require('../webpack.config')

module.exports = {
  ...config,
  output: {
    ...config.output,
    path: __dirname,
  },
  devtool: 'inline-source-map',
  devServer: {
    static: {
      directory: __dirname
    },
    open: true,
    port: 3000,
  },
}
