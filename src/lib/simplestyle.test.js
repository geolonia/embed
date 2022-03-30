'use strict';

import assert from 'assert';

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
    window.URL.createObjectURL = () => {}; // To prevent `TypeError: window.URL.createObjectURL is not a function`
    const { default: simpleStyle } = await import('./simplestyle');

    const map = new Map();
    new simpleStyle(geojson).addTo(map).fitBounds();

    assert.deepEqual([ 'geolonia-simple-style', 'geolonia-simple-style-points' ], Object.keys(map.sources));
    assert.deepEqual(8, map.layers.length);
    assert.deepEqual(true, map.bounds);
  });

  it('should has sources and layers as expected with custom IDs', async () => {
    window.URL.createObjectURL = () => {}; // To prevent `TypeError: window.URL.createObjectURL is not a function`
    const { default: simpleStyle } = await import('./simplestyle');

    const map = new Map();
    new simpleStyle(geojson, {id: 'hello-world'}).addTo(map).fitBounds();

    assert.deepEqual([ 'hello-world', 'hello-world-points' ], Object.keys(map.sources));
    assert.deepEqual(8, map.layers.length);
    assert.deepEqual(true, map.bounds);
  });

  it('should has sources and layers as expected with empty GeoJSON', async () => {
    window.URL.createObjectURL = () => {}; // To prevent `TypeError: window.URL.createObjectURL is not a function`
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
    window.URL.createObjectURL = () => {}; // To prevent `TypeError: window.URL.createObjectURL is not a function`
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
});
