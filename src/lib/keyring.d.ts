declare class Keyring {
    #private;
    /**
     * @returns API key
     */
    get apiKey(): string;
    /**
     * @returns Whether using Geolonia style (true) or external style (false)
     */
    get isGeoloniaStyle(): boolean;
    /**
     * @param isGeoloniaStyle - Set whether using Geolonia style
     */
    set isGeoloniaStyle(value: boolean);
    /**
     * @param key - API Key to set
     */
    set apiKey(key: string);
    /**
     * @returns Stage name
     */
    get stage(): string;
    /**
     * @param stage - Stage name to set
     */
    set stage(stage: string);
    /**
     * Parses the API key and stage from the URL of the current script tag.
     *
     * @param {Document} document
     */
    parse(doc?: Document): void;
    /** Reset API key and stage for testing purpose */
    reset(): void;
    /**
     * Check if the given style is a Geolonia style (requires API key)
     * Note: This is a method, not the property. Use keyring.isGeoloniaStyle property
     * to check the current style type, or call this method to check a specific style.
     * @param style - Style name or URL
     * @returns true if it's a Geolonia style (requires API key)
     */
    isGeoloniaStyleCheck(style: string): boolean;
}
declare const keyring: Keyring;
export { keyring };
