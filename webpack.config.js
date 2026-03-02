const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { DefinePlugin } = require('webpack');

const plugins = [
  new DefinePlugin({
    'process.env.MAP_PLATFORM_STAGE': JSON.stringify(process.env.MAP_PLATFORM_STAGE || 'dev'),
  }),
];
if (process.env.ANALYZE === 'true') {
  plugins.push(new BundleAnalyzerPlugin());
}

const sharedConfig = {
  plugins: plugins,
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

const embedConfig = {
  ...sharedConfig,
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
};

const embedCoreConfig = {
  ...sharedConfig,
  entry: './src/embed-core.ts',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'embed-core.js',
    chunkFilename: path.join('embed-chunks', '[chunkhash].js'),
    clean: false,
    publicPath: 'auto',
    library: {
      name: 'geoloniaEmbedCore',
      type: 'umd',
    },
  },
};

module.exports = [embedConfig, embedCoreConfig];
