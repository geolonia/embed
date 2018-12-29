const path = require('path')

module.exports = {
  entry: './src/tilecloud.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'tilecloud.js',
  },

  module: {
    rules: [
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
}
