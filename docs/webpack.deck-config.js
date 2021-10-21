const config = require('./webpack.config')

module.exports = {
  ...config,
  devServer: {
    ...config.devServer,
    open: 'deck.html',
  },
}
