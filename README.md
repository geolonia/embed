# @tilecloud/embed

[![Build Status](https://travis-ci.org/tilecloud/embed.svg?branch=master)](https://travis-ci.org/tilecloud/embed)

JS embed API for TileCloud service.

## Features

- webGL vector map rendering
- simple configuration
- map lazy rendering

## Examples

https://tilecloud.github.io/embed/

## Usage

Specify `.tilecloud` class for target elements.

```html
<!DOCTYPE html>
<html>
  <body>
    <div
      class="tilecloud"
      ...
    ></div>
    <script src="https://tilecloud.io/v1/embed?tilecloud-api-key=API-KEY"></script>
  </body>
</html>
```

Or

```html
<!DOCTYPE html>
<html>
  <body>
    <div
      class="tilecloud"
      data-key="YOUR-API-KEY"
      ...
    ></div>
    <script src="https://tilecloud.io/v1/embed"></script>
  </body>
</html>
```


You can see more examples at [https://tilecloud.github.io/embed/](https://tilecloud.github.io/embed/).

# Contributing

## Development

```shell
$ git clone git@github.com:tilecloud/embed.git
$ cd embed
$ yarn # or npm install
$ npm start
```

Then you can see `http://localhost:1234/`.
