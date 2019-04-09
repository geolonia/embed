module.exports = {
  entry: './src/embed.js',
  output: {
    path: __dirname,
    filename: 'embed.js',
  },
  devtool: 'inline-source-map',

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

  devServer: {
    open: true,
    openPage: 'index.html',
    contentBase: __dirname,
    watchContentBase: true,
    port: 1234,
  },
}
