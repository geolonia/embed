module.exports = {
  entry: './src/tilecloud.js',
  output: {
    path: __dirname,
    filename: 'tilecloud.js',
  },
  devtool: 'inline-source-map',
  devServer: {
    open: true,
    openPage: 'index.html',
    contentBase: __dirname,
    watchContentBase: true,
    port: 3000,
  },
}
