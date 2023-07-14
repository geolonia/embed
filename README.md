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

### Embed map with `<script>` tag

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

You can see more examples at [https://geolonia.github.io/embed/](https://geolonia.github.io/embed/).

### Call as a module via bandler

You can use `@geolonia/embed` with bundlers like Webpack too.

src/entry.js (Source file)

```javascript
import geolonia from '@geolonia/embed'; // `geolonia` supports the same API as `window.geolonia`.

geolonia.setApiKey('YOUR-API-KEY');

const map = new geolonia.Map({
  container: 'geolonia', // `id` of the element to insert Geolonia Map
  style: 'geolonia/midnight',
});
```

index.html

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="geolonia" ...></div>
    <!-- Call bundled JS file -->
    <script src="/dist/entry.js" defer></script>
  </body>
</html>
```

# Contributing

## Development

```shell
$ git clone git@github.com:geolonia/embed.git
$ cd embed
$ yarn
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
