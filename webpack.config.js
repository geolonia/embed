const path = require('path');

module.exports = {
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
