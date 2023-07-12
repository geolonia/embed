## Plugin Development

You can develop an extended feature as a Geolonia Embed Plugin.
Geolonia Embed Plugin should be just a function.

To define a plugin, call `window.registerPlugin(yourPlugin)`.
More detailed features are described below as the TypeScript section.

### Plugin Development with TypeScript

```typescript
import * as Geolonia from "@geolonia/embed";

const myPlugin: Geolonia.EmbedPlugin = (
  map: Geolonia.Map, // maplibregl.Map instance.
  target: HTMLElement, // HTML Element. The Map will be rendered here.
  atts: Geolonia.EmbedAttributes // data-x attributes specified at target element.
) => {
  /* Do anything with those arguments. */
};

// be sure to register plugin.
window.geolonia.registerPlugin(myPlugin);
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
