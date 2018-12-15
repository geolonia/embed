#! /usr/bin/env bash

echo "export default \`" > ./src/lib/mapbox-gl.css.js
cat ./node_modules/mapbox-gl/dist/mapbox-gl.css >> ./src/lib/mapbox-gl.css.js
echo "\`" >> ./src/lib/mapbox-gl.css.js
