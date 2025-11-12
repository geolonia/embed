const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { DefinePlugin } = require('webpack');

module.exports = {
  entry: './src/embed.ts',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'embed.js',
    chunkFilename: path.join('embed-chunks', '[chunkhash].js'),
    clean: true,
    publicPath: 'auto',
    library: {
      name: 'geoloniaEmbed',
      type: 'umd',
    },
  },
  plugins: process.env.ANALYZE === 'true' ? [new BundleAnalyzerPlugin()] : [
    new DefinePlugin({
      'process.env.MAP_PLATFORM_STAGE': JSON.stringify(process.env.MAP_PLATFORM_STAGE || 'dev'),
    })],
  module: {
    rules: [
      {
        test: /\.svg$/,
        use: {
          loader: 'svg-inline-loader',
        },
      },
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};
