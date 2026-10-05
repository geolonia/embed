# @geolonia/embed

[![build](https://github.com/geolonia/embed/actions/workflows/build.yml/badge.svg)](https://github.com/geolonia/embed/actions/workflows/build.yml)

JS embed API for Geolonia service.

## Features

- webGL vector map rendering
- simple configuration
- map lazy rendering

## Examples

https://geolonia.github.io/embed/

## Usage

Specify `.geolonia` class for target elements.

```html
<!DOCTYPE html>
<html>
  <body>
    <div class="geolonia" ...></div>
    <script src="https://cdn.geolonia.com/embed/v5/embed?geolonia-api-key=YOUR-API-KEY"></script>
  </body>
</html>
```

Or

```html
<!DOCTYPE html>
<html>
  <body>
    <div class="geolonia" data-key="YOUR-API-KEY" ...></div>
    <script src="https://cdn.geolonia.com/embed/v5/embed"></script>
  </body>
</html>
```

### Using with npm (for React, Next.js, Astro, Fresh, etc.)

For modern web frameworks, use `@geolonia/embed/core` — an entry point designed for programmatic use.

```shell
npm install @geolonia/embed
```

```typescript
import { GeoloniaMap, keyring } from "@geolonia/embed/core";

keyring.setApiKey("YOUR-API-KEY");

const map = new GeoloniaMap({
  container: "#map",
  style: "geolonia/gsi",
  center: [139.7671, 35.6812],
  zoom: 14,
});
```

Unlike the default `@geolonia/embed` entry point, `/core` does **not** automatically scan the DOM or set `window.geolonia`. This makes it safe to use in SSR environments and avoids double-initialization issues in frameworks like React, Preact, and Vue. (Its only import-time side effect is registering the bundled MapLibre worker, which is skipped outside the browser.)

### Content Security Policy

`@geolonia/embed` ships as a single file, so the MapLibre worker is embedded in the bundle and started from a `blob:` URL.
If your page sets a Content Security Policy, allow `blob:` as a worker source:

```
Content-Security-Policy: worker-src blob:;
```

### Using External Styles Without API Key

You can use external style.json URLs without a Geolonia API key. This is useful when:
- Using open-source tile servers like OpenStreetMap Japan
- Self-hosting your own tiles and styles
- Distributing maps without API key dependencies

**Note:** Geolonia API key is only required when using Geolonia's hosted styles and tiles.

```html
<!DOCTYPE html>
<html>
  <body>
    <!-- Using OpenStreetMap Japan tiles (no API key needed) -->
    <!-- Note: tile.openstreetmap.jp is for non-commercial use only -->
    <div
      class="geolonia"
      data-lat="35.6812"
      data-lng="139.7671"
      data-zoom="14"
      data-style="https://tile.openstreetmap.jp/styles/osm-bright/style.json"
    ></div>
    <script src="https://cdn.geolonia.com/embed/v5/embed"></script>
  </body>
</html>
```

You can also use npm/unpkg/jsDelivr for self-hosted or CDN distribution:

```html
<!-- Using npm CDN (unpkg) -->
<script src="https://unpkg.com/@geolonia/embed@latest/dist/embed.js"></script>

<!-- Using jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/@geolonia/embed@latest/dist/embed.js"></script>
```

#### data-style attribute

The `data-style` attribute accepts:
- **Geolonia style names**: `geolonia/basic`, `geolonia/gsi` (requires API key)
- **Full URLs**: `https://example.com/style.json`
- **Relative paths**: `./custom-style.json`, `/styles/my-style.json`
- **Files ending in .json**: Automatically resolved to absolute URLs

#### data-lang attribute

The `data-lang` attribute controls the language of map labels:

- `ja` — Japanese labels
- `en` (or any other non-Japanese value) — English labels
- `auto` — follow the browser language (`navigator.languages`)
- **omitted** — same as `auto` (follows the browser language)

Only `ja` / `ja-jp` resolve to Japanese; every other value resolves to English.

**Important:** when neither `data-lang` nor `lang` is specified, the language follows the browser setting. On a non-Japanese browser this loads the English style (`en.json`). Set it explicitly to force a language:

```html
<div class="geolonia" data-lang="ja" ...></div>
```

When using the JavaScript API (`new GeoloniaMap({...})`), pass `lang` in the options instead of a `data-lang` attribute:

```ts
const map = new GeoloniaMap({ container: "#map", lang: "ja" });
```

You can see more examples at [https://geolonia.github.io/embed/](https://geolonia.github.io/embed/).

# Contributing

## Development

### Requirements

- node.js >= 22.18

### How to build

This project uses [pnpm](https://pnpm.io/). The version is pinned in the `packageManager` field of `package.json`, so [Corepack](https://nodejs.org/api/corepack.html) (`corepack enable`) will pick up the right one.

```shell
$ git clone git@github.com:geolonia/embed.git
$ cd embed
$ pnpm install
$ pnpm start # run dev server
$ pnpm test # run tests
$ pnpm run e2e # run e2e tests
$ pnpm run build # build production bundle
```

Then you can see `http://localhost:3000/`.

## Run Bundle analyzer

```shell
$ pnpm run analyze
```

## Snapshot testing

### preparation

```shell
$ cp .envrc.sample .envrc
$ vi .envrc
$ pnpm run build
$ docker build . -t geolonia/embed
```
