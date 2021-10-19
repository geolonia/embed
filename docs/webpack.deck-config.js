const _config = require('./webpack.config')

module.exports = (...args) => {
  const config = (typeof _config === 'function' ? _config(...args) : config);
  return {
    ...config,
    devServer: {
      ...config.devServer,
      openPage: 'deck.html',
    },
  }
}
