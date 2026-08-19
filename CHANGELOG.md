# Change Logs

## @geolonia/embed

### nightly

- **Improvement**: The message shown when the map fails to initialize (typically no WebGL) now tells the visitor what to try (restart the browser, restart the device, try another browser, update the graphics driver, contact the site owner). The developer-tools sentence was removed, and the message is shortened automatically on small map containers.
- **Feature**: `data-error-message` (`errorMessage` in the programmatic API) replaces that message with your own text, or disables the error display entirely with `off`. The value is rendered as plain text.
- **Fix**: The loading animation is now removed when the map fails to initialize.

- **Feature**: Added support for external style.json URLs in `data-style` attribute
  - You can now specify full URLs: `data-style="https://tile.openstreetmap.jp/styles/osm-bright/style.json"`
  - Relative paths are also supported: `data-style="./custom-style.json"`
  - Files ending in `.json` are automatically resolved to absolute URLs
  - External styles work without a Geolonia API key
  - API key is now only required for Geolonia's hosted styles and tiles
  - Added Mixed Content warnings for HTTP styles on HTTPS pages
  - Added CORS error guidance for external styles
- **Improvement**: API key scope is now limited to Geolonia domains only (security enhancement)
- Renamed as `@geolonia/embed`
- plugin system

### v0.2.5

- Add popup if container has innerHTML
- `data-bearing` and `data-pitch` options for HTML template

### v0.2.4

- `data-hash` option for HTML template to enable URL hash routing

### v0.2.2
