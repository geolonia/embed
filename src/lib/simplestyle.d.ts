export declare class SimpleStyle {
    _loadingPromise: Promise<unknown>;
    private callFitBounds;
    private geojson;
    private map;
    private options;
    constructor(geojson: any, options?: any);
    updateData(geojson: any): this;
    addTo(map: any): this;
    fitBounds(options?: {}): this;
    /**
     * Set polygon geometries.
     */
    setPolygonGeometries(): void;
    /**
     * Set line geometries.
     */
    setLineGeometries(): void;
    /**
     * Setup point geometries.
     */
    setPointGeometries(): void;
    setPopup(map: any, source: any): Promise<void>;
    /**
     * Setup cluster markers
     */
    setCluster(): void;
    setGeoJSON(geojson: any): void;
}
