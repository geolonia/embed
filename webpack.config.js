const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

const config = {
  entry: './src/embed.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'embed.js',
  },
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

module.exports = (env, options) => {
  if (env === 'development' || options.mode === 'development') {
    config.plugins = [
      ...config.plugins || [],
      new BundleAnalyzerPlugin(),
    ];
  }
  return config;
};

