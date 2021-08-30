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

## Snapshot testing

### preparation

```shell
$ cp .envrc.sample .envrc
$ vi .envrc
$ npm run build:embed
$ docker build . -t geolonia/embed
```

### run snapshot test with Docker

```shell
$ npm run build
# Run snapshot test
$ docker run --rm \
  -v $(pwd)/snapshots:/app/snapshots \
  -v $(pwd)/dist:/app/dist \
  geolonia/embed
# Update the snapshot
$ docker run --rm \
  -v $(pwd)/snapshots:/app/snapshots \
  -v $(pwd)/dist:/app/dist \
  -e UPDATE_SNAPSHOT=true \
  geolonia/embed
# check diff on your eyes
$ open snapshots
```

### run snapshot test locally

```shell
$ npm run build
$ npm run test:snapshot
```
