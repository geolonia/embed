# @tilecloud/js

[![Build Status](https://travis-ci.org/tilecloud/tilecloud.js.svg?branch=master)](https://travis-ci.org/tilecloud/tilecloud.js)
[![npm version](https://badge.fury.io/js/%40tilecloud%2Fjs.svg)](https://badge.fury.io/js/%40tilecloud%2Fjs)

JS API for Tilecloud service.

## features

- webGL vector map rendering
- simple configuration
- map lazy rendering

## usage

### zero config

Specify `tilecloud-basic` class for target elements.

```html
<!DOCTYPE html>
<html>
  <body>
    <div
      class="tilecloud"
      data-map="osm-bright"
      data-lat="35.681"
      data-lng="139.767"
      data-zoom="12"
    ></div>
    <script src="path/to/tilecloud.js?apiKey=xxx"></script>
  </body>
</html>
```

### Use as a module

```shell
$ yarn add @tilecloud/js # or npm install @tilecloud/js
```

```javascript
import { preRender } from '@tilecloud/js'

const element = getElementById('map')
const style = 'https://tilecloud.io/path/to/style.json' // URL or Style object

preRender(element, style)
```

## development

```shell
$ git clone git@github.com:tilecloud/tilecloud.js.git
$ cd tilecloud.js
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

### build tilecloud scripts to distribute from tilecloud endpoint

```shell
$ npm run build:tilecloud
# see ./dist
```

### deploy demo site to GitHub pages

```shell
$ npm run deploy
```

### publish package

```shell
$ npm version patch
$ git push origin v0.1.2 # specify new version to publish
```
