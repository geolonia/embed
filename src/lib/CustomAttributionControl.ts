import { DOM, bindAll } from './maplibre-util';
import type { ControlPosition, IControl } from 'maplibre-gl';

/**
 *  This class is a copy of maplibre-gl-js's AttributionControl class and rewrite by shadow DOM.
 * https://github.com/maplibre/maplibre-gl-js/blob/main/src/ui/control/attribution_control.ts
 */

/**
 * When the map is too small to display the full attribution, it will be
 * collapsed in to a "i" icon. It is open by default, and will hide itself
 * when user interaction is detected.
 * For more information on why this is open by default, see the following links:
 *
 * The OSM Foundation attribution guidelines.
 * https://wiki.osmfoundation.org/wiki/Licence/Attribution_Guidelines#Interactive_maps
 * > You may use a mechanism to fade/collapse the attribution under certain conditions:
 * >  * immediately with a dismiss interaction, for example clicking an ‘x’ in the corner of a dialog
 * >  * automatically on map interaction such as panning, clicking, or zooming
 * >  * automatically after five seconds. This also applies to splash screens or pop-ups.
 *
 * This is the issue where attribution is open by default in the MapLibre GL JS library:
 * https://github.com/maplibre/maplibre-gl-js/issues/205
 */

class CustomAttributionControl implements IControl {
  private options;
  private _map;
  private _compact;
  private _container;
  private _shadowContainer;
  private _innerContainer;
  private _compactButton;
  private _editLink;
  private _attribHTML;
  private styleId;
  private styleOwner;
  private printQuery;
  private onMediaPrintChange;

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

  getDefaultPosition(): ControlPosition {
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
    .maplibregl-ctrl {
      font: 12px/20px Helvetica Neue,Arial,Helvetica,sans-serif;
      clear: both;
      pointer-events: auto;
      transform: translate(0);
    }

    .maplibregl-ctrl-attrib-button:focus,.maplibregl-ctrl-group button:focus {
      box-shadow: 0 0 2px 2px #0096ff
    }

    .maplibregl-ctrl.maplibregl-ctrl-attrib {
      background-color: hsla(0,0%,100%,.5);
      margin: 0;
      padding: 0 5px
    }

    @media screen {
       .maplibregl-ctrl-attrib.maplibregl-compact {
            background-color: #fff;
            border-radius: 12px;
            box-sizing: content-box;
            min-height: 20px;
            padding: 2px 24px 2px 0;
            position: relative;
            margin: 10px 10px 10px auto;
            width: 0;
        }

       .maplibregl-ctrl-attrib.maplibregl-compact-show {
            padding: 2px 28px 2px 8px;
            visibility: visible;
            width: auto;
        }

        .maplibregl-ctrl-bottom-left>.maplibregl-ctrl-attrib.maplibregl-compact-show,.maplibregl-ctrl-top-left>.maplibregl-ctrl-attrib.maplibregl-compact-show {
            border-radius: 12px;
            padding: 2px 8px 2px 28px
        }

       .maplibregl-ctrl-attrib.maplibregl-compact .maplibregl-ctrl-attrib-inner {
            display: none
        }

       .maplibregl-ctrl-attrib-button {
            background-color: hsla(0,0%,100%,.5);
            background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg' fill-rule='evenodd'%3E%3Cpath d='M4 10a6 6 0 1 0 12 0 6 6 0 1 0-12 0m5-3a1 1 0 1 0 2 0 1 1 0 1 0-2 0m0 3a1 1 0 1 1 2 0v3a1 1 0 1 1-2 0'/%3E%3C/svg%3E");
            border: 0;
            border-radius: 12px;
            box-sizing: border-box;
            cursor: pointer;
            display: none;
            height: 24px;
            outline: none;
            position: absolute;
            right: 0;
            top: 0;
            width: 24px
        }

        .maplibregl-ctrl-attrib summary.maplibregl-ctrl-attrib-button {
            appearance: none;
            list-style: none
        }

        .maplibregl-ctrl-attrib summary.maplibregl-ctrl-attrib-button::-webkit-details-marker {
            display: none
        }

        .maplibregl-ctrl-bottom-left .maplibregl-ctrl-attrib-button,.maplibregl-ctrl-top-left .maplibregl-ctrl-attrib-button {
            left: 0
        }

        .maplibregl-ctrl-attrib.maplibregl-compact .maplibregl-ctrl-attrib-button,.maplibregl-ctrl-attrib.maplibregl-compact-show .maplibregl-ctrl-attrib-inner {
            display: block
        }

        .maplibregl-ctrl-attrib.maplibregl-compact-show .maplibregl-ctrl-attrib-button {
            background-color: rgb(0 0 0/5%)
        }

        .maplibregl-ctrl-bottom-right>.maplibregl-ctrl-attrib.maplibregl-compact:after {
            bottom: 0;
            right: 0
        }

        .maplibregl-ctrl-top-right>.maplibregl-ctrl-attrib.maplibregl-compact:after {
            right: 0;
            top: 0
        }

        .maplibregl-ctrl-top-left>.maplibregl-ctrl-attrib.maplibregl-compact:after {
            left: 0;
            top: 0
        }

        .maplibregl-ctrl-bottom-left>.maplibregl-ctrl-attrib.maplibregl-compact:after {
            bottom: 0;
            left: 0
        }
    }

    @media screen and (-ms-high-contrast:active) {
        .maplibregl-ctrl-attrib.maplibregl-compact:after {
            background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg' fill-rule='evenodd' fill='%23fff'%3E%3Cpath d='M4 10a6 6 0 1 0 12 0 6 6 0 1 0-12 0m5-3a1 1 0 1 0 2 0 1 1 0 1 0-2 0m0 3a1 1 0 1 1 2 0v3a1 1 0 1 1-2 0'/%3E%3C/svg%3E")
        }
    }

    @media screen and (-ms-high-contrast:black-on-white) {
        .maplibregl-ctrl-attrib.maplibregl-compact:after {
            background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg width='24' height='24' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg' fill-rule='evenodd'%3E%3Cpath d='M4 10a6 6 0 1 0 12 0 6 6 0 1 0-12 0m5-3a1 1 0 1 0 2 0 1 1 0 1 0-2 0m0 3a1 1 0 1 1 2 0v3a1 1 0 1 1-2 0'/%3E%3C/svg%3E")
        }
    }

    @media print {
      .maplibregl-ctrl-attrib-button {
        display: none!important;
      }
    }

    .maplibregl-ctrl-attrib a {
        color: rgba(0,0,0,.75);
        text-decoration: none;
        white-space: nowrap;
    }

    .maplibregl-ctrl-attrib a:hover {
        color: inherit;
        text-decoration: underline
    }

    .maplibregl-attrib-empty {
        display: none
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

    this.printQuery = window.matchMedia('print');
    this.onMediaPrintChange = (e) => {
      if (e.matches) {
        // force open
        this._shadowContainer.setAttribute('open', '');
        this._shadowContainer.classList.remove('maplibregl-compact-show');
      }
    };
    this.printQuery.addEventListener('change', this.onMediaPrintChange);

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

    this.printQuery.removeEventListener('change', this.onMediaPrintChange);
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
