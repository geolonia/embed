# @tilecloud/embed

[![Build Status](https://travis-ci.org/tilecloud/embed.svg?branch=master)](https://travis-ci.org/tilecloud/embed)

JS embed API for TileCloud service.

## features

- webGL vector map rendering
- simple configuration
- map lazy rendering

## usage

### zero config

Specify `.tilecloud` class for target elements. If you want to call the JS-API from external origin, please specify `?tilecloud=true` query.

```html
<!DOCTYPE html>
<html>
  <body>
    <div
      class="tilecloud"
      data-style="osm-bright" // 'osm-bright' is default
      data-lat="35.681"
      data-lng="139.767"
      data-zoom="12"
      data-hash="false"
    ></div>
    <script src="https://tilecloud.io/v1/embed?key=API-KEY"></script>
  </body>
</html>
```

### Use as a module

```shell
$ yarn add @tilecloud/embed # or npm install @tilecloud/embed
```

```javascript
import { preRender } from '@tilecloud/embed'

const element = getElementById('map')
const style = 'https://tilecloud.io/path/to/style.json' // URL or Style object

preRender(element, style)
```

## development

```shell
$ git clone git@github.com:tilecloud/embed.git
$ cd embed
$ yarn # or npm install
```

### Run demo locally

```shell
$ npm start
```

### build library

```shell
$ npm run build
# see ./lib
```

### build embed scripts to distribute from api.tilecloud.io

```shell
$ npm run build:embed
# see ./dist
```

### deploy demo site to GitHub pages

```shell
$ npm run deploy
```

### publish package (for commiters)

```shell
$ npm version patch
$ git push origin v0.1.2 # specify new version to publish
```
