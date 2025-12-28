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
    <script src="https://cdn.geolonia.com/v1/embed?geolonia-api-key=YOUR-API-KEY"></script>
  </body>
</html>
```

Or

```html
<!DOCTYPE html>
<html>
  <body>
    <div class="geolonia" data-key="YOUR-API-KEY" ...></div>
    <script src="https://cdn.geolonia.com/v1/embed"></script>
  </body>
</html>
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
    <div
      class="geolonia"
      data-lat="35.6812"
      data-lng="139.7671"
      data-zoom="14"
      data-style="https://tile.openstreetmap.jp/styles/osm-bright/style.json"
    ></div>
    <script src="https://cdn.geolonia.com/v1/embed"></script>
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
