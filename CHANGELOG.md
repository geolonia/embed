# Change Logs

## @geolonia/embed

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
