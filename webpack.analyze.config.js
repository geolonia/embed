const config = require('./webpack.config');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  ...config,
  plugins: [
    ...config.plugins || [],
    new BundleAnalyzerPlugin(),
  ],
};
