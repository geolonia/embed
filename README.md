# @geolonia/embed

[![Build Status](https://travis-ci.org/geolonia/embed.svg?branch=master)](https://travis-ci.org/geolonia/embed)

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
    <script src="https://cdn.geolonia.com/v1/embed?geolonia-api-key=API-KEY"></script>
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

## Plugin Development

You can develop an extended feature as a Geolonia Embed Plugin.
Geolonia Embed Plugin should be just a function.

To define a plugin, call `window.registerPlugin(yourPlugin)`.
More detailed features are described below as the TypeScript section.

### Plugin

`before-map` fires before `new Map()` and filter parameters. `after-map` fires after `new Map()`.

```html
<script src="https://cdn.geolonia.com/v1/embed?geolonia-api-key=YOUR-API-KEY">
<script>
window.geolonia.registerPliginHook('after-map', (target, atts, options) => { /* plugin code */ });
window.geolonia.registerPliginHook('after-map', (map, target, atts) => { /* plugin code */ });
<script>
```

# Contributing

## Development

```shell
$ git clone git@github.com:geolonia/embed.git
$ cd embed
$ yarn # or npm install
$ npm start
$ npm test
```

Then you can see `http://localhost:1234/`.

## Integration test

```shell
$ cp .envrc.sample .envrc
$ vi .envrc
$ npm run test:integration
```