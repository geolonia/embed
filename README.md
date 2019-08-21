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
    <div
      class="geolonia"
      ...
    ></div>
    <script src="https://api.geolonia.com/v1/embed?geolonia-api-key=API-KEY"></script>
  </body>
</html>
```

Or

```html
<!DOCTYPE html>
<html>
  <body>
    <div
      class="geolonia"
      data-key="YOUR-API-KEY"
      ...
    ></div>
    <script src="https://api.geolonia.com/v1/embed"></script>
  </body>
</html>
```


You can see more examples at [https://geolonia.github.io/embed/](https://geolonia.github.io/embed/).

# Contributing

## Development

```shell
$ git clone git@github.com:geolonia/embed.git
$ cd embed
$ yarn # or npm install
$ npm start
```

Then you can see `http://localhost:1234/`.
