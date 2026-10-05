# Change Logs

## @geolonia/embed

### Unreleased

- **Internal**: パッケージマネージャを npm から pnpm へ移行しました（[#520](https://github.com/geolonia/embed/issues/520)）。配布物の中身は変わりません。`@types/geojson` を devDependencies に明示（これまで hoist に依存していました）、`.npmrc` の設定を `pnpm-workspace.yaml` へ移設、CI と publish を pnpm 化しています。

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
