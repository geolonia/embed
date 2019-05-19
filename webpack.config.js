const path = require('path')
const LicenseInfoWebpackPlugin = require('license-info-webpack-plugin').default

module.exports = {
  entry: './src/embed.js',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'embed.js',
  },

  plugins:
    process.env.NODE_ENV === 'production'
      ? [
        new LicenseInfoWebpackPlugin({
          glob: '{LICENSE,license,License}*',
        }),
      ]
      : void 0,

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
