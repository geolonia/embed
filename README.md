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

For modern web frameworks, use `@geolonia/embed/core` — a side-effect-free entry point designed for programmatic use.

```shell
npm install @geolonia/embed
```

```typescript
import { GeoloniaMap, keyring } from "@geolonia/embed/core";

keyring.apiKey = "YOUR-API-KEY";

const map = new GeoloniaMap({
  container: "#map",
  style: "geolonia/gsi",
  center: [139.7671, 35.6812],
  zoom: 14,
});
```

Unlike the default `@geolonia/embed` entry point, `/core` does **not** automatically scan the DOM or set `window.geolonia`. This makes it safe to use in SSR environments and avoids double-initialization issues in frameworks like React, Preact, and Vue.

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

You can see more examples at [https://geolonia.github.io/embed/](https://geolonia.github.io/embed/).

### Error message when the map fails to initialize

When the map cannot be initialized (typically because WebGL is unavailable on the
device), the embed replaces the map with a message that tells the visitor what to
try: restart the browser, restart the device, try another browser, update the
graphics driver, and contact the site owner if it still fails. The message shrinks
to a shorter version, and finally to the headline alone, as the map container gets
smaller.

Use `data-error-message` to take over that message:

```html
<!-- Replace the wording -->
<div
  class="geolonia"
  data-error-message="Sorry, the map is unavailable. Please call 0120-000-000."
></div>

<!-- Show nothing at all, e.g. when the site renders its own fallback -->
<div class="geolonia" data-error-message="off"></div>
```

The value is rendered as plain text; HTML is not interpreted. The same option is
available to the programmatic API as `errorMessage`.


# Contributing

## Development

### Requirements

- node.js >= 22.18

### How to build

```shell
$ git clone git@github.com:geolonia/embed.git
$ cd embed
$ npm install
$ npm start # run dev server
$ npm test # run tests
$ npm run e2e # run e2e tests
$ npm run build # build production bundle
```

Then you can see `http://localhost:3000/`.

## Run Bundle analyzer

```shell
$ npm run analyze
```

## Snapshot testing

### preparation

```shell
$ cp .envrc.sample .envrc
$ vi .envrc
$ npm run build
$ docker build . -t geolonia/embed
```
