import type { ControlPosition, IControl } from 'maplibre-gl';
export declare class GeoloniaControl implements IControl {
    private container;
    onAdd(): HTMLDivElement;
    onRemove(): void;
    getDefaultPosition(): ControlPosition;
}
