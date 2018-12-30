# tilecloud.js

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
      class="tilecloud-basic"
      data-lat="35.681"
      data-lng="139.767"
      data-zoom="12"
    ></div>
    <script src="path/to/tilecloud.js?apiKey=xxx"></script>
  </body>
</html>
```

### Use as module

```javascript
import { preRender } from 'tilecloud.js'

const element = getElementById('map')
const styleUrl = 'https://tilecloud.io/path/to/style.json&apiKey=xxx'

preRender(element, styleUrl)
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

### build tilecloud scripts

```shell
$ npm run build:tilecloud
# see ./dist
```
