import { DOM, bindAll } from './util';

/**
 *  This class is a copy of maplibre-gl-js's AttributionControl class and rewrite by shadow DOM.
 * https://github.com/maplibre/maplibre-gl-js/blob/main/src/ui/control/attribution_control.ts
 */

class CustomAttributionControl {

  constructor(options = {}) {
    this.options = options;
    this._map;
    this._compact;
    this._container;
    this._shadowContainer;
    this._innerContainer;
    this._compactButton;
    this._editLink;
    this._attribHTML;
    this.styleId;
    this.styleOwner;

    bindAll([
      '_toggleAttribution',
      '_updateData',
      '_updateCompact',
      '_updateCompactMinimize',
    ], this);
  }

  getDefaultPosition() {
    return 'bottom-right';
  }

  onAdd(map) {
    this._map = map;
    this._compact = this.options && this.options.compact;
    this._container = DOM.create('div');

    const shadow = this._container.attachShadow({mode: 'open'});

    this._shadowContainer = DOM.create('details', 'maplibregl-ctrl maplibregl-ctrl-attrib');
    this._compactButton = DOM.create('summary', 'maplibregl-ctrl-attrib-button', this._shadowContainer);
    this._compactButton.addEventListener('click', this._toggleAttribution);
    this._setElementTitle(this._compactButton, 'ToggleAttribution');
    this._innerContainer = DOM.create('div', 'maplibregl-ctrl-attrib-inner', this._shadowContainer);

    const style = document.createElement('style');
    style.textContent = `
    .mapboxgl-ctrl, .maplibregl-ctrl {
        clear: both;
        pointer-events: auto;
        transform: translate(0);
    }
    .mapboxgl-ctrl.mapboxgl-ctrl-attrib, .maplibregl-ctrl.maplibregl-ctrl-attrib {
      padding: 0 5px;
      background-color: hsla(0,0%,100%,.5);
      margin: 0;
    }
    .mapboxgl-ctrl-attrib-button, .maplibregl-ctrl-attrib-button {
      display: none;
      cursor: pointer;
      position: absolute;
      background-image: url(data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg' fill-rule='evenodd'%3E%3Cpath d='M4 10a6 6 0 1012 0 6 6 0 10-12 0m5-3a1 1 0 102 0 1 1 0 10-2 0m0 3a1 1 0 112 0v3a1 1 0 11-2 0'/%3E%3C/svg%3E);
      background-color: hsla(0,0%,100%,.5);
      width: 24px;
      height: 24px;
      box-sizing: border-box;
      border-radius: 12px;
      outline: none;
      top: 0;
      right: 0;
      border: 0;
    }
    .mapboxgl-ctrl-attrib a, .maplibregl-ctrl-attrib a {
      color: rgba(0,0,0,.75);
      text-decoration: none;
    }
    `;

    this._updateAttributions();
    this._updateCompact();

    this._map.on('styledata', this._updateData);
    this._map.on('sourcedata', this._updateData);
    this._map.on('terrain', this._updateData);
    this._map.on('resize', this._updateCompact);
    this._map.on('drag', this._updateCompactMinimize);

    shadow.appendChild(style);
    shadow.appendChild(this._shadowContainer);

    return this._container;
  }

  onRemove() {
    DOM.remove(this._container);

    this._map.off('styledata', this._updateData);
    this._map.off('sourcedata', this._updateData);
    this._map.off('terrain', this._updateData);
    this._map.off('resize', this._updateCompact);
    this._map.off('drag', this._updateCompactMinimize);

    this._map = undefined;
    this._compact = undefined;
    this._attribHTML = undefined;
  }

  _setElementTitle(element, title) {
    const str = this._map._getUIString(`AttributionControl.${title}`);
    element.title = str;
    element.setAttribute('aria-label', str);
  }

  _toggleAttribution() {
    if (this._shadowContainer.classList.contains('maplibregl-compact')) {
      if (this._shadowContainer.classList.contains('maplibregl-compact-show')) {
        this._shadowContainer.setAttribute('open', '');
        this._shadowContainer.classList.remove('maplibregl-compact-show');
      } else {
        this._shadowContainer.classList.add('maplibregl-compact-show');
        this._shadowContainer.removeAttribute('open');
      }
    }
  }

  _updateData(e) {
    if (e && (e.sourceDataType === 'metadata' || e.sourceDataType === 'visibility' || e.dataType === 'style' || e.type === 'terrain')) {
      this._updateAttributions();
    }
  }

  _updateAttributions() {
    if (!this._map.style) return;
    let attributions = [];
    if (this.options.customAttribution) {
      if (Array.isArray(this.options.customAttribution)) {
        attributions = attributions.concat(
          this.options.customAttribution.map((attribution) => {
            if (typeof attribution !== 'string') return '';
            return attribution;
          }),
        );
      } else if (typeof this.options.customAttribution === 'string') {
        attributions.push(this.options.customAttribution);
      }
    }

    if (this._map.style.stylesheet) {
      const stylesheet = this._map.style.stylesheet;
      this.styleOwner = stylesheet.owner;
      this.styleId = stylesheet.id;
    }

    const sourceCaches = this._map.style.sourceCaches;
    for (const id in sourceCaches) {
      const sourceCache = sourceCaches[id];
      if (sourceCache.used || sourceCache.usedForTerrain) {
        const source = sourceCache.getSource();
        if (source.attribution && attributions.indexOf(source.attribution) < 0) {
          attributions.push(source.attribution);
        }
      }
    }

    // remove any entries that are whitespace
    attributions = attributions.filter((e) => String(e).trim());

    // remove any entries that are substrings of another entry.
    // first sort by length so that substrings come first
    attributions.sort((a, b) => a.length - b.length);
    attributions = attributions.filter((attrib, i) => {
      for (let j = i + 1; j < attributions.length; j++) {
        if (attributions[j].indexOf(attrib) >= 0) { return false; }
      }
      return true;
    });

    // check if attribution string is different to minimize DOM changes
    const attribHTML = attributions.join(' | ');
    if (attribHTML === this._attribHTML) return;

    this._attribHTML = attribHTML;

    if (attributions.length) {
      this._innerContainer.innerHTML = attribHTML;
      this._shadowContainer.classList.remove('maplibregl-attrib-empty');
    } else {
      this._shadowContainer.classList.add('maplibregl-attrib-empty');
    }
    this._updateCompact();
    // remove old DOM node from _editLink
    this._editLink = null;
  }

  _updateCompact() {
    if (this._map.getCanvasContainer().offsetWidth <= 640 || this._compact) {
      if (this._compact === false) {
        this._shadowContainer.setAttribute('open', '');
      } else if (!this._shadowContainer.classList.contains('maplibregl-compact') && !this._shadowContainer.classList.contains('maplibregl-attrib-empty')) {
        this._shadowContainer.setAttribute('open', '');
        this._shadowContainer.classList.add('maplibregl-compact', 'maplibregl-compact-show');
      }
    } else {
      this._shadowContainer.setAttribute('open', '');
      if (this._shadowContainer.classList.contains('maplibregl-compact')) {
        this._shadowContainer.classList.remove('maplibregl-compact', 'maplibregl-compact-show');
      }
    }
  }

  _updateCompactMinimize() {
    if (this._shadowContainer.classList.contains('maplibregl-compact')) {
      if (this._shadowContainer.classList.contains('maplibregl-compact-show')) {
        this._shadowContainer.classList.remove('maplibregl-compact-show');
      }
    }
  }

}

export default CustomAttributionControl;
