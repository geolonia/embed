'use strict';

import assert from 'assert';
import nodeFetch from 'node-fetch';

window.URL.createObjectURL = () => {}; // To prevent `TypeError: window.URL.createObjectURL is not a function`
window.requestAnimationFrame = (cb) => cb();
window.fetch = nodeFetch;

class Map {
  constructor(json, options) {
    this.json = json;
    this.options = options;
    this.sources = {};
    this.layers = [];
    this.bounds = false;
  }

  addSource(id, source) {
    this.sources[id] = source;
  }

  addLayer(layer) {
    this.layers.push(layer);
  }

  on() {

  }

  getSource(id) {
    class getSource {
      constructor(id, sources) {
        this.id = id;
        this.sources = sources;
      }
      setData(geojson) {
        this.sources[this.id] = {
          type: 'geojson',
          data: geojson,
        };
      }
    }

    return new getSource(id, this.sources);
  }

  getContainer() {
    return { dataset: true };
  }

  // It should not be fired if GeoJSON is empty.
  fitBounds() {
    this.bounds = true;
  }
}

const geojson = {
  'type': 'FeatureCollection',
  'features': [
    {
      'type': 'Feature',
      'properties': {},
      'geometry': {
        'type': 'Point',
        'coordinates': [
          139.77012634277344,
          35.68518697509636,
        ],
      },
    },
  ],
};

describe('Tests for simpleStyle()', () => {
  it('should has sources and layers as expected', async () => {
    const { default: simpleStyle } = await import('./simplestyle');

    const map = new Map();
    new simpleStyle(geojson).addTo(map).fitBounds();

    assert.deepEqual([ 'geolonia-simple-style', 'geolonia-simple-style-points' ], Object.keys(map.sources));
    assert.deepEqual(8, map.layers.length);
    assert.deepEqual(true, map.bounds);
  });

  it('should has sources and layers as expected with custom IDs', async () => {
    const { default: simpleStyle } = await import('./simplestyle');

    const map = new Map();
    new simpleStyle(geojson, {id: 'hello-world'}).addTo(map).fitBounds();

    assert.deepEqual([ 'hello-world', 'hello-world-points' ], Object.keys(map.sources));
    assert.deepEqual(8, map.layers.length);
    assert.deepEqual(true, map.bounds);
  });

  it('should has sources and layers as expected with empty GeoJSON', async () => {
    const { default: simpleStyle } = await import('./simplestyle');

    const map = new Map();

    const empty = {
      'type': 'FeatureCollection',
      'features': [],
    };

    new simpleStyle(empty, {id: 'hello-world'}).addTo(map).fitBounds();

    assert.deepEqual([ 'hello-world', 'hello-world-points' ], Object.keys(map.sources));
    assert.deepEqual(8, map.layers.length);
    assert.deepEqual(false, map.bounds);
  });

  it('should update GeoJSON', async () => {
    const { default: simpleStyle } = await import('./simplestyle');

    const map = new Map();

    const empty = {
      'type': 'FeatureCollection',
      'features': [],
    };

    const ss = new simpleStyle(empty).addTo(map).fitBounds();

    assert.deepEqual([ 'geolonia-simple-style', 'geolonia-simple-style-points' ], Object.keys(map.sources));
    assert.deepEqual(8, map.layers.length);
    assert.deepEqual(false, map.bounds);
    assert.deepEqual(0, map.sources['geolonia-simple-style-points'].data.features.length);

    ss.updateData(geojson); // The GeoJSON is not empty.
    assert.deepEqual(false, map.bounds); // `fitBounds()` doesn't fire.
    assert.deepEqual(1, map.sources['geolonia-simple-style-points'].data.features.length);
  });

  it('should load GeoJSON from url', async () => {
    const { default: simpleStyle } = await import('./simplestyle');

    const map = new Map();
    const geojson = 'https://gist.githubusercontent.com/miya0001/56c3dc174f5cdf1d9565cbca0fbd3c48/raw/c13330036d28ef547a8a87cb6df3fa12de19ddb6/test.geojson';
    const ss = new simpleStyle(geojson);
    ss.addTo(map).fitBounds();

    await ss._loadingPromise;

    const geometry = map.sources['geolonia-simple-style'].data.features[0].geometry;
    const coordinates = geometry.coordinates;
    const type = geometry.type;

    const expectCoordinates = [
      [
        139.6870422363281,
        35.73425097869431,
      ],
      [
        139.76943969726562,
        35.73425097869431,
      ],
      [
        139.73922729492188,
        35.66399091134812,
      ],
      [
        139.70352172851562,
        35.698571062054015,
      ],
    ];

    assert.deepEqual(expectCoordinates, coordinates);
    assert.deepEqual('LineString', type);
    assert.deepEqual(true, map.bounds);
  });

  it('should load empty GeoJSON when failed to fetch GeoJSON', async () => {
    const { default: simpleStyle } = await import('./simplestyle');

    const map = new Map();
    const geojson = 'https://example.com/404.geojson';
    const ss = new simpleStyle(geojson);
    ss.addTo(map).fitBounds();

    await ss._loadingPromise;

    assert.deepEqual([ 'geolonia-simple-style', 'geolonia-simple-style-points' ], Object.keys(map.sources));
    assert.deepEqual(8, map.layers.length);
    assert.deepEqual(false, map.bounds);
  });

  it('should update GeoJSON from url', async () => {
    const { default: simpleStyle } = await import('./simplestyle');

    const map = new Map();
    const empty = {
      'type': 'FeatureCollection',
      'features': [],
    };

    const ss = new simpleStyle(empty);
    ss.addTo(map).fitBounds();

    await ss._loadingPromise;

    const geojson = 'https://gist.githubusercontent.com/miya0001/56c3dc174f5cdf1d9565cbca0fbd3c48/raw/c13330036d28ef547a8a87cb6df3fa12de19ddb6/test.geojson';

    ss.updateData(geojson);

    await ss._loadingPromise;

    const geometry = map.sources['geolonia-simple-style'].data.features[0].geometry;
    const coordinates = geometry.coordinates;
    const type = geometry.type;

    const expectCoordinates = [
      [
        139.6870422363281,
        35.73425097869431,
      ],
      [
        139.76943969726562,
        35.73425097869431,
      ],
      [
        139.73922729492188,
        35.66399091134812,
      ],
      [
        139.70352172851562,
        35.698571062054015,
      ],
    ];

    assert.deepEqual(expectCoordinates, coordinates);
    assert.deepEqual('LineString', type);
    assert.deepEqual(true, map.bounds);
  });

});
