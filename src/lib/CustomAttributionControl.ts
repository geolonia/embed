//@ts-ignore TypeScript doesn't know about manually loaded CSS (this is a Webpack feature)
import maplibreCSS from '!!css-loader?{"sourceMap":false,"exportType":"string"}!maplibre-gl/dist/maplibre-gl.css';
import { DOM } from './maplibre-util';

import type {Map, ControlPosition, IControl, MapDataEvent} from 'maplibre-gl';
import type {StyleSpecification} from '@maplibre/maplibre-gl-style-spec';

/**
 *  This class is a copy of maplibre-gl-js's AttributionControl class and is extended to
 * run in Shadow DOM, so it isn't affected by outside CSS.
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

/**
 * The {@link AttributionControl} options object
 */
export type AttributionControlOptions = {
  /**
   * If `true`, the attribution control will always collapse when moving the map. If `false`,
   * force the expanded attribution control. The default is a responsive attribution that collapses when the user moves the map on maps less than 640 pixels wide.
   * **Attribution should not be collapsed if it can comfortably fit on the map. `compact` should only be used to modify default attribution when map size makes it impossible to fit default attribution and when the automatic compact resizing for default settings are not sufficient.**
   */
  compact?: boolean;
  /**
   * Attributions to show in addition to any other attributions.
   */
  customAttribution?: string | Array<string>;
};

export const defaultAttributionControlOptions: AttributionControlOptions = {
  compact: true,
  customAttribution: []
};

/**
 * An `AttributionControl` control presents the map's attribution information. By default, the attribution control is expanded (regardless of map width).
 * @group Markers and Controls
 * @example
 * ```ts
 * let map = new Map({attributionControl: false})
 *     .addControl(new AttributionControl({
 *         compact: true
 *     }));
 * ```
 */
export default class CustomAttributionControl implements IControl {
  options: AttributionControlOptions;
  _map: Map;
  _compact: boolean | undefined;
  _shadowRoot: HTMLElement;
  _container: HTMLElement;
  _innerContainer: HTMLElement;
  _compactButton: HTMLElement;
  _editLink: HTMLAnchorElement;
  _attribHTML: string;
  styleId: string;
  styleOwner: string;

  /**
   * @param options - the attribution options
   */
  constructor(options: AttributionControlOptions = defaultAttributionControlOptions) {
    this.options = options;
  }

  getDefaultPosition(): ControlPosition {
    return 'bottom-right';
  }

  /** {@inheritDoc IControl.onAdd} */
  onAdd(map: Map) {
    this._map = map;
    this._compact = this.options.compact;
    this._shadowRoot = DOM.create('div');
    const shadow = this._shadowRoot.attachShadow({mode: 'open'});
    this._container = DOM.create('details', 'maplibregl-ctrl maplibregl-ctrl-attrib');
    this._compactButton = DOM.create('summary', 'maplibregl-ctrl-attrib-button', this._container);
    this._compactButton.addEventListener('click', this._toggleAttribution);
    this._setElementTitle(this._compactButton, 'ToggleAttribution');
    this._innerContainer = DOM.create('div', 'maplibregl-ctrl-attrib-inner', this._container);

    const style = document.createElement('style');
    style.textContent = maplibreCSS;

    this._updateAttributions();
    this._updateCompact();

    this._map.on('styledata', this._updateData);
    this._map.on('sourcedata', this._updateData);
    this._map.on('terrain', this._updateData);
    this._map.on('resize', this._updateCompact);
    this._map.on('drag', this._updateCompactMinimize);

    shadow.appendChild(style);
    shadow.appendChild(this._container);

    return this._shadowRoot;
  }

  /** {@inheritDoc IControl.onRemove} */
  onRemove() {
    DOM.remove(this._shadowRoot);

    this._map.off('styledata', this._updateData);
    this._map.off('sourcedata', this._updateData);
    this._map.off('terrain', this._updateData);
    this._map.off('resize', this._updateCompact);
    this._map.off('drag', this._updateCompactMinimize);

    this._map = undefined;
    this._compact = undefined;
    this._attribHTML = undefined;
  }

  _setElementTitle(element: HTMLElement, title: 'ToggleAttribution' | 'MapFeedback') {
    const str = this._map._getUIString(`AttributionControl.${title}`);
    element.title = str;
    element.setAttribute('aria-label', str);
  }

  _toggleAttribution = () => {
    if (this._container.classList.contains('maplibregl-compact')) {
      if (this._container.classList.contains('maplibregl-compact-show')) {
        this._container.setAttribute('open', '');
        this._container.classList.remove('maplibregl-compact-show');
      } else {
        this._container.classList.add('maplibregl-compact-show');
        this._container.removeAttribute('open');
      }
    }
  };

  _updateData = (e: MapDataEvent) => {
    if (e && (e.sourceDataType === 'metadata' || e.sourceDataType === 'visibility' || e.dataType === 'style' || e.type === 'terrain')) {
      this._updateAttributions();
    }
  };

  _updateAttributions() {
    if (!this._map.style) return;
    let attributions: Array<string> = [];
    if (this.options.customAttribution) {
      if (Array.isArray(this.options.customAttribution)) {
        attributions = attributions.concat(
          this.options.customAttribution.map(attribution => {
            if (typeof attribution !== 'string') return '';
            return attribution;
          })
        );
      } else if (typeof this.options.customAttribution === 'string') {
        attributions.push(this.options.customAttribution);
      }
    }

    if (this._map.style.stylesheet) {
      const stylesheet = this._map.style.stylesheet as StyleSpecification & { owner: string; id: string };
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
    attributions = attributions.filter(e => String(e).trim());

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
      this._container.classList.remove('maplibregl-attrib-empty');
    } else {
      this._container.classList.add('maplibregl-attrib-empty');
    }
    this._updateCompact();
    // remove old DOM node from _editLink
    this._editLink = null;
  }

  _updateCompact = () => {
    if (this._map.getCanvasContainer().offsetWidth <= 640 || this._compact) {
      if (this._compact === false) {
        this._container.setAttribute('open', '');
      } else if (!this._container.classList.contains('maplibregl-compact') && !this._container.classList.contains('maplibregl-attrib-empty')) {
        this._container.setAttribute('open', '');
        this._container.classList.add('maplibregl-compact', 'maplibregl-compact-show');
      }
    } else {
      this._container.setAttribute('open', '');
      if (this._container.classList.contains('maplibregl-compact')) {
        this._container.classList.remove('maplibregl-compact', 'maplibregl-compact-show');
      }
    }
  };

  _updateCompactMinimize = () => {
    if (this._container.classList.contains('maplibregl-compact')) {
      if (this._container.classList.contains('maplibregl-compact-show')) {
        this._container.classList.remove('maplibregl-compact-show');
      }
    }
  };
}
