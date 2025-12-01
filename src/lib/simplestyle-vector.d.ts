declare class SimpleStyleVector {
    private url;
    private sourceName;
    constructor(url: any);
    addTo(map: any): void;
    /**
     * Set polygon geometries.
     *
     * @param map
     */
    setPolygonGeometries(map: any): void;
    /**
     * Set line geometries.
     *
     * @param map
     */
    setLineGeometries(map: any): void;
    /**
     * Setup point geometries.
     *
     * @param map
     */
    setPointGeometries(map: any): void;
    setPopup(map: any, source: any): Promise<void>;
}
export default SimpleStyleVector;
