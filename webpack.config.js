const configs = require('../webpack.config')
const embedConfig = configs[0] // embed.ts エントリのみ使用

module.exports = {
  ...embedConfig,
  output: {
    ...embedConfig.output,
    path: __dirname,
    filename: 'embed',
    clean: false,
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
