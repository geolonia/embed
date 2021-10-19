const _config = require('../webpack.config')

module.exports = (env, options) => {
  const config = typeof _config === 'function' ? _config(env, options) : config
  return {
    ...config,
    output: {
      path: __dirname,
      filename: 'embed',
    },
    devtool: env === 'development' || options.mode === 'development' ? 'inline-source-map' : undefined,

    devServer: {
      open: true,
      openPage: 'index.html',
      contentBase: __dirname,
      watchContentBase: true,
      host: 'localhost',
      port: 3000,
      disableHostCheck: true
    },
  }
}
