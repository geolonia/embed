# tilecloud.js

JS API for Tilecloud service.

## features

- webGL vector map rendering
- simple configuration
- map lazy rendering

## usage

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
    <script src="path/to/tilecloud.js"></script>
  </body>
</html>
```

## development

```shell
$ git clone git@github.com:tilecloud/tilecloud.js.git
$ cd tilecloud.js
$ yarn # or npm install
```

## Run demo locally

```shell
$ npm start
```

## build library

```shell
$ npm run build
$ # see ./dist
```
