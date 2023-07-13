const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  entry: './src/embed.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'embed.js',
    chunkFilename: path.join('embed-chunks', '[chunkhash].js'),
    clean: true,
    publicPath: '',
  },
  plugins: process.env.ANALYZE === 'true' ? [new BundleAnalyzerPlugin()] : [],
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: {
          loader: 'svg-inline-loader',
        },
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
};
