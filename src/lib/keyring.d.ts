declare class Keyring {
    #private;
    /**
     * @returns API key
     */
    get apiKey(): string;
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
}
declare const keyring: Keyring;
export { keyring };
