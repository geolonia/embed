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
    <script src="https://cdn.geolonia.com/embed/v5/embed?geolonia-api-key=YOUR-API-KEY"></script>
  </body>
</html>
```

Or

```html
<!DOCTYPE html>
<html>
  <body>
    <div class="geolonia" data-key="YOUR-API-KEY" ...></div>
    <script src="https://cdn.geolonia.com/embed/v5/embed"></script>
  </body>
</html>
```

### Using with npm (for React, Next.js, Astro, Fresh, etc.)

For modern web frameworks, use `@geolonia/embed/core` — an entry point designed for programmatic use.

```shell
npm install @geolonia/embed
```

```typescript
import { GeoloniaMap, keyring } from "@geolonia/embed/core";

keyring.setApiKey("YOUR-API-KEY");

const map = new GeoloniaMap({
  container: "#map",
  style: "geolonia/gsi",
  center: [139.7671, 35.6812],
  zoom: 14,
});
```

Unlike the default `@geolonia/embed` entry point, `/core` does **not** automatically scan the DOM or set `window.geolonia`. This makes it safe to use in SSR environments and avoids double-initialization issues in frameworks like React, Preact, and Vue. (Its only import-time side effect is registering the bundled MapLibre worker, which is skipped outside the browser.)

### Content Security Policy

`@geolonia/embed` ships as a single file, so the MapLibre worker is embedded in the bundle and started from a `blob:` URL.
If your page sets a Content Security Policy, allow `blob:` as a worker source:

```
Content-Security-Policy: worker-src blob:;
```

### Using External Styles Without API Key

You can use external style.json URLs without a Geolonia API key. This is useful when:
- Using open-source tile servers like OpenStreetMap Japan
- Self-hosting your own tiles and styles
- Distributing maps without API key dependencies

**Note:** Geolonia API key is only required when using Geolonia's hosted styles and tiles.

```html
<!DOCTYPE html>
<html>
  <body>
    <!-- Using OpenStreetMap Japan tiles (no API key needed) -->
    <!-- Note: tile.openstreetmap.jp is for non-commercial use only -->
    <div
      class="geolonia"
      data-lat="35.6812"
      data-lng="139.7671"
      data-zoom="14"
      data-style="https://tile.openstreetmap.jp/styles/osm-bright/style.json"
    ></div>
    <script src="https://cdn.geolonia.com/embed/v5/embed"></script>
  </body>
</html>
```

You can also use npm/unpkg/jsDelivr for self-hosted or CDN distribution:

```html
<!-- Using npm CDN (unpkg) -->
<script src="https://unpkg.com/@geolonia/embed@latest/dist/embed.js"></script>

<!-- Using jsDelivr -->
<script src="https://cdn.jsdelivr.net/npm/@geolonia/embed@latest/dist/embed.js"></script>
```

#### data-style attribute

The `data-style` attribute accepts:
- **Geolonia style names**: `geolonia/basic`, `geolonia/gsi` (requires API key)
- **Full URLs**: `https://example.com/style.json`
- **Relative paths**: `./custom-style.json`, `/styles/my-style.json`
- **Files ending in .json**: Automatically resolved to absolute URLs

#### data-lang attribute

The `data-lang` attribute controls the language of map labels:

- `ja` — Japanese labels
- `en` (or any other non-Japanese value) — English labels
- `auto` — follow the browser language (`navigator.languages`)
- **omitted** — same as `auto` (follows the browser language)

Only `ja` / `ja-jp` resolve to Japanese; every other value resolves to English.

**Important:** when neither `data-lang` nor `lang` is specified, the language follows the browser setting. On a non-Japanese browser this loads the English style (`en.json`). Set it explicitly to force a language:

```html
<div class="geolonia" data-lang="ja" ...></div>
```

When using the JavaScript API (`new GeoloniaMap({...})`), pass `lang` in the options instead of a `data-lang` attribute:

```ts
const map = new GeoloniaMap({ container: "#map", lang: "ja" });
```

You can see more examples at [https://geolonia.github.io/embed/](https://geolonia.github.io/embed/).

# Contributing

## Development

### Requirements

- node.js >= 22.18

### How to build

This project uses [pnpm](https://pnpm.io/). The version is pinned in two places, which must be kept
in sync: the `packageManager` field of `package.json` (used by
[Corepack](https://nodejs.org/api/corepack.html) and by `pnpm/action-setup` in CI) and
`.tool-versions` (used by [asdf](https://asdf-vm.com/) and [mise](https://mise.jdx.dev/)).
`pnpm-workspace.yaml` sets `pmOnFail: ignore`, so pnpm itself will not correct a mismatch; the
`build` workflow compares the two pins instead and fails if they disagree.

```shell
$ git clone git@github.com:geolonia/embed.git
$ cd embed
$ pnpm install
$ pnpm start # run dev server
$ pnpm test # run tests
$ pnpm run e2e # run e2e tests
$ pnpm run build # build production bundle
```

Then you can see `http://localhost:3000/`.

## Dependency updates

Dependencies are updated by Dependabot, configured in `.github/dependabot.yml`. Minor and patch
updates arrive as one grouped weekly PR. Major version updates are ignored for now — there is a
backlog of them and each needs its own plan — but security updates still arrive for any version,
major included, because an `ignore` on `version-update:semver-major` only scopes version updates.

`pnpm-workspace.yaml` sets `pmOnFail: ignore`, and that line is load-bearing: without it pnpm 12
writes `pnpm-lock.yaml` as two YAML documents, GitHub's dependency-graph parser reads only the
first one (which holds nothing but pnpm itself), and no npm package ever reaches the graph — so no
Dependabot alert is raised. See `pnpm-workspace.yaml` and
[dependabot-core#15904](https://github.com/dependabot/dependabot-core/issues/15904). Keep the
lockfile a single YAML document.

To check by hand:

```shell
$ pnpm audit            # vulnerabilities
$ pnpm outdated         # available updates
$ pnpm why maplibre-gl  # who pulls a package in
```

## Run Bundle analyzer

```shell
$ pnpm run analyze
```

## Snapshot testing

### preparation

```shell
$ cp .envrc.sample .envrc
$ vi .envrc
$ pnpm run build
$ docker build . -t geolonia/embed
```
