'use strict';

import assert from 'assert';

class Map {
  constructor(json, options) {
    this.json = json;
    this.options = options;
    this.ids = [];
    this.layers = [];
    this.bounds = false;
  }

  addSource(id) {
    this.ids.push(id);
  }

  addLayer(layer) {
    this.layers.push(layer);
  }

  on() {

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
    new simpleStyle(geojson).addTo(map);

    assert.deepEqual([ 'geolonia-simple-style', 'geolonia-simple-style-points' ], map.ids);
    assert.deepEqual(8, map.layers.length);
    assert.deepEqual(true, map.bounds);
  });

  it('should has sources and layers as expected with custom IDs', async () => {
    window.URL.createObjectURL = () => {}; // To prevent `TypeError: window.URL.createObjectURL is not a function`
    const { default: simpleStyle } = await import('./simplestyle');

    const map = new Map();
    new simpleStyle(geojson, {id: 'hello-world'}).addTo(map);

    assert.deepEqual([ 'hello-world', 'hello-world-points' ], map.ids);
    assert.deepEqual(8, map.layers.length);
    assert.deepEqual(true, map.bounds);
  });

  it('should has sources and layers as expected with with empty GeoJSON', async () => {
    window.URL.createObjectURL = () => {}; // To prevent `TypeError: window.URL.createObjectURL is not a function`
    const { default: simpleStyle } = await import('./simplestyle');

    const map = new Map();

    const empty = {
      'type': 'FeatureCollection',
      'features': [],
    };

    new simpleStyle(empty, {id: 'hello-world'}).addTo(map);

    assert.deepEqual([ 'hello-world', 'hello-world-points' ], map.ids);
    assert.deepEqual(8, map.layers.length);
    assert.deepEqual(false, map.bounds);
  });
});
