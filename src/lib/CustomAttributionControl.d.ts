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
declare class CustomAttributionControl implements IControl {
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
    constructor(options?: {});
    getDefaultPosition(): ControlPosition;
    onAdd(map: any): any;
    onRemove(): void;
    _setElementTitle(element: any, title: any): void;
    _toggleAttribution(): void;
    _updateData(e: any): void;
    _updateAttributions(): void;
    _updateCompact(): void;
    _updateCompactMinimize(): void;
}
export default CustomAttributionControl;
