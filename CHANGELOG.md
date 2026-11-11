# Change Logs

## @geolonia/embed

### v6.0.0

`6.0.0-pre.2` から続いた pre 表記が外れる最初の正式版です。配布物に関わる変更は、同梱する maplibre-gl の更新と型定義の変更の 2 点です。それ以外は開発環境の整備で、地図の見た目や `data-*` 属性の振る舞いは 6.0.0-pre.6 から変わりません。

- **Fix**: 同梱する maplibre-gl を `6.12.0` から `6.16.0` へ更新しました（[#549](https://github.com/geolonia/embed/pull/549)）。
  - **6.0.0-pre.5 で案内した `setStyle` の回避策は不要になりました。** 「WebGL コンテキストが失われている最中に `setStyle()` を呼ぶと未捕捉エラーになる」不具合は 6.14.0 で修正されており（maplibre-gl-js#8693）、6.16.0 はこれを含みます。`map.on('webglcontextrestored', ...)` の中まで `setStyle()` を遅らせる必要はもうありません。
  - WebGL コンテキストまわりでは、**喪失後のリサイズで地図が 1 ピクセルに潰れる**不具合も 6.16.0 で直っています（maplibre-gl-js#8837）。`webglcontextlost` が発火する前にリサイズが入ると起きていました。
  - **iOS / iPadOS Safari** の修正が複数入りました。省メモリのために OS がバックグラウンドの worker を落としても地図が読み込み続けるようになり（maplibre-gl-js#8461、#8491）、iPadOS 16 Safari で地図が真っ白のまま反応しなくなる問題（maplibre-gl-js#8364）も解消しています。Safari 26.6 以降でページをバックグラウンドに置くとタイルが読み込まれなくなる回帰にも対処が入りました（maplibre-gl-js#8780）。
  - **文字まわり**では、`font-faces` で表示している文字が PBF の取得後に glyphs URL 側のグリフへ入れ替わってしまう問題（maplibre-gl-js#8490）と、glyphs URL を持つスタイルでデーヴァナーガリー・タイ・テルグなどの表記が字体混在や文字落ちを起こす問題（maplibre-gl-js#8741）が直っています。
  - ほかに、ETag が変わらないサーバーで `setFilter()` などの再読み込み時に期限切れベクタータイルがエラーになる問題（maplibre-gl-js#8771）、`GeoJSONSource.getBounds` が空のジオメトリを持つ地物で例外を投げる問題（maplibre-gl-js#8814）、180 度をまたいで移動した後に `addImage` の画像が出ない問題（maplibre-gl-js#8858）などが含まれます。
  - **Note**: `Map` の生成時に `transformStyle` を渡せるようになり（maplibre-gl-js#8786）、`dragRotate` に `{ around: 'pointer' }` が入りました（maplibre-gl-js#8628）。これに伴い `aroundCenter` は非推奨です。`window.geolonia` 経由で maplibre の API を直接触っている場合のみ関係します。
- **Breaking**: `EmbedAttributes` のインデックスシグネチャが `string | number` から `string | number | undefined` になりました（[#559](https://github.com/geolonia/embed/pull/559)）。TypeScript を `strict` でビルドするようにしたのに合わせたもので、`data-choropleth` のように指定したときだけキーが入る属性の型と整合させています。型定義を使っていて、任意のキーで引いた値を `string | number` へそのまま代入している箇所があるとコンパイルが通らなくなります。`?? ''` などで未定義を畳んでください。JavaScript から使っている場合は影響ありません。
- **Change**: プラグインの型が使いやすくなりました（[#559](https://github.com/geolonia/embed/pull/559)）。`registerPlugin` が generic になり、`EmbedPlugin<{ foo: string }>` のように固有の `data-*` を要求するプラグインをそのまま登録できます。`window.geolonia.registerPlugin` も同じ型です。あわせて `EmbedPluginAttributes`（`{ [otherKey: string]: string | undefined }`）を公開し、`EmbedPlugin` の型引数の制約をこれにしました。プラグイン固有の `data-*` は `container.dataset` 経由で必ず文字列として渡るため、`EmbedPlugin<{ foo: number }>` は宣言した時点で弾かれます。
- **Internal**: TypeScript を 6 系へ更新し、`strict` を有効にしました（[#559](https://github.com/geolonia/embed/pull/559)）。`moduleResolution` を `bundler` へ変更し、`rootDir` と `types` を明示しています。`checkPermission` の内部で `window.top?.location.origin` と、親要素を持たないコンテナで `MutationObserver` を登録しない形に変えていますが、どちらも実質到達しない経路で戻り値は変わりません。TypeScript 7 へは上げられないことが分かっており、理由と再開条件は [#560](https://github.com/geolonia/embed/issues/560) に残してあります。
- **Internal**: ESLint を 10 系へ更新しました（[#559](https://github.com/geolonia/embed/pull/559)）。`eslint-plugin-import` は 2025-06-20 を最後にリリースが止まっていて eslint 10 を peer に宣言していないため、フォークの `eslint-plugin-import-x` へ置き換えています（[#562](https://github.com/geolonia/embed/pull/562)、[#561](https://github.com/geolonia/embed/issues/561)）。
- **Internal**: vitest を 5 系へ更新しました（[#556](https://github.com/geolonia/embed/pull/556)、[#555](https://github.com/geolonia/embed/issues/555)）。
- **Internal**: 未使用の依存を 4 件削除しました（[#559](https://github.com/geolonia/embed/pull/559)）。`@types/jsdom`、`node-fetch`、`eslint-plugin-react`、`eslint-plugin-react-hooks` で、依存ツリーから 50 パッケージ減っています。React を使っていた頃の名残（`tsconfig.json` の `jsx`、`webpack.config.js` の `.tsx`、ESLint の jsx/tsx glob）も落としました。バンドルの中身は変わっていません。
- **Internal**: 開発用の Node.js を 22.23.4 に上げました（[#559](https://github.com/geolonia/embed/pull/559)）。`jsdom` 30 が `^22.22.2` を要求するためで、`.tool-versions` と README を揃えています。
- **Internal**: Dependabot の更新を取り込みました（[#536](https://github.com/geolonia/embed/pull/536)、[#539](https://github.com/geolonia/embed/pull/539)、[#540](https://github.com/geolonia/embed/pull/540)、[#547](https://github.com/geolonia/embed/pull/547)、[#548](https://github.com/geolonia/embed/pull/548)、[#553](https://github.com/geolonia/embed/pull/553)、[#554](https://github.com/geolonia/embed/pull/554)、[#558](https://github.com/geolonia/embed/pull/558)）。いずれも開発時のみの依存か、GitHub Actions の更新です。

### v6.0.0-pre.6

`@geolonia/maps-core` を `^0.8.0` へ更新し、GeoJSON をデータの値で描き分ける `data-*` 属性を追加しました。同梱する maplibre-gl は `6.12.0` のままです。

- **Feature**: `data-choropleth`、`data-heatmap`、`data-circle-*` 属性で、GeoJSON をコロプレス、ヒートマップ、データ駆動の円で描けるようにしました（[#546](https://github.com/geolonia/embed/issues/546)）。maps-core 0.8.0 の `choropleth`、`heatmap`、`circle` オプションへそのまま渡します。例は `docs/data-viz/` にあります。
  - `data-choropleth` にプロパティ名を指定すると、ポリゴンをその値で塗り分けます。色は `data-choropleth-colors`、値の範囲は `data-choropleth-range`（`最小,最大`）で指定します。範囲を省略するか、数値 2 つとして読めない値や最小が最大以上の値を指定すると、データの最小値と最大値を使います。地物の simplestyle の `fill` より優先し、`fill-opacity` が無い地物は不透明度 0.7 で描きます。
  - `data-heatmap` にプロパティ名を指定すると、その値を重みにしたヒートマップで描きます。`on` で重みなし、`off` か空の値でヒートマップにしません（`on` と `off` は大文字小文字と前後の空白を区別しません）。色は `data-heatmap-colors` で指定します。ヒートマップにするとクラスタリングとポイントのマーカーは表示しません。
  - `data-circle-size` と `data-circle-color` にプロパティ名を指定すると、ポイントの円の大きさと色をその値で変えます。色は `data-circle-colors` で指定します。指定するとクラスタリングは行わず、`marker-symbol` を持つポイントも円で描きます（アイコンとタイトルは表示しません）。
  - 色はカンマで区切ります。`rgb(0, 0, 255)` のような括弧の中のカンマは区切りとして扱いません。`-colors` と `-range` は、描き方を有効にする属性が無いときは無視します。
  - **Note**: これまで同じ名前の `data-*` 属性を独自の用途で付けていたページでは、その値が地図の描き方に使われるようになります。
- **Change**: ナビゲーションコントロールのコンパスが地図の傾きも表し、クリックで向きと傾きの両方を戻すようになりました（[maps-core#154](https://github.com/geolonia/maps-core/pull/154)）。`data-navigation-control` を使うすべての地図に効きます。傾けていない地図では見た目は変わりません。
- **Change**: `new geolonia.Map({ transformRequest })` で渡した関数が、Geolonia のソースとスプライトへのリクエストにも、maps-core が `key` や `sessionId` を付けた後の URL で呼ばれるようになりました（[maps-core#140](https://github.com/geolonia/maps-core/pull/140)）。HTML 属性だけで地図を使っている場合は影響ありません。
  - **Note**: `map.setTransformRequest()` で関数を差し替えると、maps-core の変換も外れます。後から差し替える場合は `key` や `sessionId` を自分で付ける必要があります。
- **Internal**: `@geolonia/maps-core` `^0.8.0` に依存します（[#544](https://github.com/geolonia/embed/issues/544)）。あわせてポップアップ本文のサニタイズに使う sanitize-html が `2.18.0` から `2.18.1` になりました。

### v6.0.0-pre.5

配布物に関わる変更は、maplibre-gl の更新とライセンス表記の修正の 2 点です。それ以外は開発環境と CI の整備で、`dist/` の中身は 6.0.0-pre.4 と実質同一です。

- **Fix**: 同梱する maplibre-gl を `6.11.2` から `6.12.0` へ更新しました。利用者に関係する修正として、1 つの attribution に閉じていないタグがあると他の attribution まで消えてしまう問題（各 attribution を個別にサニタイズするよう修正、maplibre-gl-js#8569）、`GeoJSONSource#setData` を worker の処理より速く呼ぶとメモリが増え続けてページがクラッシュする問題、terrain 有効時に `fill-outline-color` と塗りのアンチエイリアス縁が描画されない問題などが含まれます。
  - **Note**: 6.12.0 には、WebGL コンテキストが失われている最中に `setStyle` を呼ぶと未捕捉エラーになる不具合があります（maplibre-gl-js#8693 で 6.14.0 にて修正）。embed 自身はこのコードパスを通りませんが、`window.geolonia` 経由で `map.setStyle()` を直接呼んでいる場合は該当しえます。
    - **回避策**: コンテキストが失われている間は `setStyle()` を呼ばず、`map.on('webglcontextrestored', ...)` の中で適用してください。maplibre はコンテキスト復元時に painter を再生成したうえでこのイベントを発火するため、この中での `setStyle()` は安全です。喪失は `map.on('webglcontextlost', ...)` で検知できます。
    - なお maplibre は**喪失前のスタイルを復元時に自動で適用し直す**ため、スタイルを切り替えていない場合は特に対処は要りません。
    - `try`/`catch` では防げません。エラーは `setStyle()` の呼び出し時ではなく、破棄済みの painter でレンダリングしようとした時点で発生します（6.14.0 の修正も、コンテキスト喪失中はレンダリングを飛ばすというものです）。
    - 6.14.0 への更新は [#534](https://github.com/geolonia/embed/issues/534) で対応します。
- **Fix**: `dist/embed-core.js` に maplibre-gl のライセンス表記が付かなくなっていた問題を修正しました。6.0.0-pre.4 では `dist/embed-core.js.LICENSE.txt` が出力されず、maplibre-gl を同梱しながら表記が無い状態で公開されていました（6.0.0-pre.3 までは出力されていました）。terser が maplibre のソース先頭の `@license` コメントを、付随するコードごと落としていたのが原因です。webpack の `BannerPlugin` で明示的に付与するよう変更し、偶然に依存しないようにしました。
- **Internal**: パッケージマネージャを npm から pnpm へ移行しました（[#520](https://github.com/geolonia/embed/issues/520)）。配布物の中身は変わりません。`@types/geojson` を devDependencies に明示（これまで hoist に依存していました）、`.npmrc` の設定を `pnpm-workspace.yaml` へ移設、CI と publish を pnpm 化しています。
- **Internal**: Dependabot が動かなくなっていた問題を解消しました（[#524](https://github.com/geolonia/embed/issues/524)）。pnpm 12 は `pnpm-lock.yaml` を複数ドキュメントで書き出しますが、GitHub の依存グラフのパーサーは先頭のドキュメントしか読まないため、グラフが 23 パッケージまで縮んでアラートが出ない状態でした。`pnpm-workspace.yaml` の `pmOnFail: ignore` で単一ドキュメントに戻し（796 パッケージに回復）、あわせて `.github/dependabot.yml` を追加しています。
- **Internal**: webpack 系のツールチェーンをまとめて更新しました（[#527](https://github.com/geolonia/embed/issues/527)）。webpack-dev-server 6 / webpack-cli 7 / webpack-bundle-analyzer 5 / css-loader 7 / style-loader 4 へ上げ、未使用だった babel-loader を削除しています。いずれも開発時のみの依存です。これにより `uuid` の脆弱性アラート（GHSA-w5hq-g745-h8pq、webpack-dev-server 5 の sockjs 経由）が解消し、open なアラートは 0 件になりました。出力の差分は webpack の内部モジュール ID の採番のみで、ファイル構成は一致しています。
- **Internal**: production バンドル（`dist/embed.js`）を直接読み込む e2e を追加しました（[#529](https://github.com/geolonia/embed/pull/529)）。これまでの e2e は dev サーバーのバンドルを読んでおり、minify やローダーの更新で production だけが壊れる事故を検知できませんでした。
- **Internal**: 開発環境と CI を整備しました。pnpm を `.tool-versions` で管理し、`package.json` の `packageManager` とのズレを CI で検査します（[#526](https://github.com/geolonia/embed/pull/526)）。また workflow の GitHub Actions をすべて commit SHA で固定し（[#530](https://github.com/geolonia/embed/pull/530)）、長く `@v1` のままだった `aws-actions/configure-aws-credentials`（→ v6.3.0）と `chetan/git-restore-mtime-action`（→ v2.3）、および `actions/checkout`（→ v7.0.1）、`actions/setup-node`（→ v7.0.0）を更新しました。

### v6.0.0-pre.4

- **Breaking**: バンドルする maplibre-gl を v6 系（`6.11.2`）へ更新しました（[#518](https://github.com/geolonia/embed/issues/518)）。`@geolonia/maps-core` `^0.6.0` の `peerDependencies` が `maplibre-gl: ^6.0.0` になったことへの追従です。maplibre-gl v6 にデフォルトエクスポートはありません。`window.geolonia` 経由で maplibre の API を直接触っている場合は [maplibre-gl v6 の変更点](https://github.com/maplibre/maplibre-gl-js/releases) を確認してください。
- **Fix**: UMD バンドルで地図が表示されない問題に対処しました。maplibre-gl v6 は worker を `import.meta.url` 基準で解決しますが、UMD 出力では webpack が `import.meta.url` をビルド時に解決してしまうため、実行時に worker を読み込めません。embed は 1 ファイルで完結する配布形態を保つため、worker を esbuild で自己完結する 1 ファイルへ束ねてバンドルへ埋め込み、実行時に Blob URL 化して maplibre に渡します。
  - **Note**: このため worker は `blob:` URL から起動します。Content-Security-Policy を設定しているページでは `worker-src blob:` の許可が必要です。
  - **Note**: worker を埋め込むぶん配布ファイルが大きくなります。`dist/embed.js` は gzip で約 297 KB → 455 KB になりました。
- **Internal**: `@geolonia/maps-core` `^0.6.0` に依存します。0.6.0 は ESM-only（`main` と `exports.require` を廃止）ですが、embed は webpack で `exports.import` を解決するため影響はありません。
- **Internal**: dependabot の [#498](https://github.com/geolonia/embed/pull/498) 相当のセキュリティ更新を取り込みました（`jsdom` `^29.1.1`、`webpack-dev-server` `^5.2.6` と、webpack / postcss / js-yaml / follow-redirects / shell-quote 等の推移的依存）。いずれも開発時のみの依存で、配布物には含まれません。

### v6.0.0-pre.3

- **Fix**: maplibre-gl 5.11.0 以降で帰属表示が空になる問題を修正しました（[#512](https://github.com/geolonia/embed/issues/512)）。ソースに指定した `attribution` だけでなく、ベーススタイルの `© Geolonia` / `© OpenStreetMap` も表示されない状態でした。修正の実体は [maps-core#102](https://github.com/geolonia/maps-core/pull/102) で、embed 側は依存を更新して取り込みます。
- **Internal**: `@geolonia/maps-core` `^0.5.1` に依存します。

### v6.0.0-pre.2

コア実装を `@geolonia/maps-core` に委譲し、embed は「HTML 埋め込みラッパー」に専念する構成へ移行しました。

- **Refactor**: 地図コア（`GeoloniaMap` / `GeoloniaMarker` / `SimpleStyle` / `SimpleStyleVector` / `keyring` / attribution・logo コントロール等）を [`@geolonia/maps-core`](https://github.com/geolonia/maps-core) に移管。embed 側には `data-*` 属性のパースと DOM 自動走査・遅延読み込み・プラグイン機構といったラッパー機能のみを残しました。
- **Compat**: `GeoloniaMap` コンストラクタは `GeoloniaMapOptions` オブジェクト形式（`new geolonia.Map({ container })`）を推奨しますが、旧 embed 互換として CSS セレクタ文字列（`new geolonia.Map('#map')`）や HTMLElement の直接指定も引き続き受け付けます（[maps-core#90](https://github.com/geolonia/maps-core/issues/90)）。legacy 形式ではコンテナの `data-*` 属性を読み取って options に反映します。
- **Breaking**: `keyring.parse()`（DOM スキャン）は廃止されました。API キーは `<script src="...?geolonia-api-key=KEY">` から embed が読み取り、`keyring.setApiKey()` で maps-core に渡します（既存の script タグ方式は引き続き動作します）。
- **Internal**: maps-core が内包する依存（pmtiles / sanitize-html / tinycolor2 / turf / gesture-handling 等）を embed の直接依存から削除しました。
- **Internal**: `@geolonia/maps-core` `^0.4.3` に依存します。

### nightly

- **Feature**: Added support for external style.json URLs in `data-style` attribute
  - You can now specify full URLs: `data-style="https://tile.openstreetmap.jp/styles/osm-bright/style.json"`
  - Relative paths are also supported: `data-style="./custom-style.json"`
  - Files ending in `.json` are automatically resolved to absolute URLs
  - External styles work without a Geolonia API key
  - API key is now only required for Geolonia's hosted styles and tiles
  - Added Mixed Content warnings for HTTP styles on HTTPS pages
  - Added CORS error guidance for external styles
- **Improvement**: API key scope is now limited to Geolonia domains only (security enhancement)
- Renamed as `@geolonia/embed`
- plugin system

### v0.2.5

- Add popup if container has innerHTML
- `data-bearing` and `data-pitch` options for HTML template

### v0.2.4

- `data-hash` option for HTML template to enable URL hash routing

### v0.2.2
