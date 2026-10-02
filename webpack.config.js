const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { DefinePlugin } = require('webpack');
const esbuild = require('esbuild');

/**
 * maplibre-gl v6 の worker を、依存する `maplibre-gl-shared.mjs` ごと自己完結する
 * 1 ファイルへ束ね、その中身を文字列として返す。
 *
 * v6 の worker は `import.meta.url` 基準の実 URL として解決されるが、UMD 出力では
 * webpack が `import.meta.url` をビルドマシンの `file:///...` へ置換してしまい、
 * maplibre はそれを `https?:` でないと判断して worker URL を空文字へフォールバックする
 * （例外もエラーも出ないまま地図だけが出ない）。UMD の利点である単一ファイル配布を保つため、
 * 別ファイルを配るのではなくバンドルへ埋め込む。`src/lib/maplibre-worker.ts` を参照。
 *
 * @see https://github.com/geolonia/embed/issues/518
 * @returns {string} worker のソースコード
 */
const bundleMaplibreWorkerSource = () => {
  const result = esbuild.buildSync({
    entryPoints: [require.resolve('maplibre-gl/dist/maplibre-gl-worker.mjs')],
    bundle: true,
    format: 'esm',
    minify: true,
    write: false,
  });
  return result.outputFiles[0].text;
};

const plugins = [
  new DefinePlugin({
    'process.env.MAP_PLATFORM_STAGE': JSON.stringify(process.env.MAP_PLATFORM_STAGE || 'dev'),
    __MAPLIBRE_WORKER_SOURCE__: JSON.stringify(bundleMaplibreWorkerSource()),
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
        // maplibre-gl v6 は worker URL のフォールバック経路で
        // `new URL(expr, import.meta.url)` を使う。webpack はこれを解決できない
        // asset 参照と見なして "Critical dependency" を警告し、dist ディレクトリ全体の
        // context module を作る。worker は DefinePlugin による埋め込みで解決済みで
        // この経路には到達しないため、maplibre に限って `new URL()` の asset 解釈を切る。
        test: /[\\/]node_modules[\\/]maplibre-gl[\\/].+\.mjs$/,
        parser: { url: false },
      },
      {
        test: /\.svg$/,
        use: {
          loader: 'svg-inline-loader',
        },
      },
      {
        test: /\.tsx?$/,
        use: {
          loader: 'ts-loader',
          options: {
            configFile: 'tsconfig.build.json',
          },
        },
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
  name: 'embed',
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
  name: 'embed-core',
  dependencies: ['embed'],
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
