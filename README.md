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

### Plugin Development with TypeScript

```typescript
import * as Geolonia from "@geolonia/embed";

const myPlugin: Geolonia.EmbedPlugin = (
  map: Geolonia.Map, // mapboxgl.Map instance.
  target: HTMLElement, // HTML Element. The Map will be rendered here.
  atts: Geolonia.EmbedAttributes // data-x attributes specified at target element.
) => {
  /* Do anything with those arguments. */
};

// be sure to register plugin.
window.geolonia.registerPligin(myPlugin);
```

### Plugin Usage

Load the plugins after loading Embed API.

```html
<!DOCTYPE html>
<html>
  <body>
    <div class="geolonia" ...></div>
    <script src="https://cdn.geolonia.com/v1/embed?geolonia-api-key=API-KEY"></script>
    <script src="https://example.com/path/to/your/plugin1.js"></script>
    <script src="https://example.com/path/to/your/plugin2.js"></script>
  </body>
</html>
```

# Contributing

## Development

```shell
$ git clone git@github.com:geolonia/embed.git
$ cd embed
$ yarn # or npm install
$ npm start
```

Then you can see `http://localhost:1234/`.
