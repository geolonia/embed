class Keyring {
  #apiKey: string;
  #stage: string;
  #isGeoloniaStyle: boolean;

  /**
   * @returns API key
   */
  get apiKey() {
    if (!this.#apiKey) {
      this.parse();
    }
    return this.#apiKey;
  }
  /**
   * @returns Whether using Geolonia style (true) or external style (false)
   */
  get isGeoloniaStyle() {
    return this.#isGeoloniaStyle;
  }
  /**
   * @param isGeoloniaStyle - Set whether using Geolonia style
   */
  set isGeoloniaStyle(value: boolean) {
    this.#isGeoloniaStyle = value;
  }
  /**
   * @param key - API Key to set
   */
  set apiKey(key: string) {
    this.#apiKey = key;
  }
  /**
   * @returns Stage name
   */
  get stage() {
    if (!this.#stage) {
      this.parse();
    }
    return this.#stage;
  }
  /**
   * @param stage - Stage name to set
   */
  set stage(stage: string) {
    this.#stage = stage;
  }

  /**
   * Parses the API key and stage from the URL of the current script tag.
   *
   * @param {Document} document
   */
  public parse(doc: Document = document) {
    const scripts: HTMLScriptElement[] | HTMLCollectionOf<HTMLScriptElement> =
      doc.currentScript
        ? [doc.currentScript as HTMLScriptElement]
        : doc.getElementsByTagName('script');

    for (const script of scripts) {
      const url = new URL(
        script.src.startsWith('https://') ||
        script.src.startsWith('http://') ||
        script.src.startsWith('//')
          ? script.src
          : `https://${location.host}/${script.src}`,
      );
      const apiKey = url.searchParams.get('geolonia-api-key');

      if (apiKey) {
        this.#apiKey = apiKey;

        this.#stage = process.env.MAP_PLATFORM_STAGE || 'dev';

        break;
      }
    }

    if (!this.#stage) {
      this.#stage = 'dev';
    }

    if (this.#isGeoloniaStyle && !this.#apiKey) {
      throw new Error('Cannot load API key.');
    }
  }

  /** Reset API key and stage for testing purpose */
  public reset() {
    this.#apiKey = undefined;
    this.#stage = undefined;
    this.#isGeoloniaStyle = false;
  }

  /**
   * Check if the given style is a Geolonia style (requires API key)
   * Note: This is a method, not the property. Use keyring.isGeoloniaStyle property 
   * to check the current style type, or call this method to check a specific style.
   * @param style - Style name or URL
   * @returns true if it's a Geolonia style (requires API key)
   */
  public isGeoloniaStyleCheck(style: string): boolean {
    if (!style || style === '') {
      // Default style is Geolonia
      return true;
    }

    // Check if it's a Geolonia CDN or API URL
    if (style.startsWith('https://cdn.geolonia.com/style/') || 
        style.startsWith('https://api.geolonia.com/')) {
      return true;
    }

    // If it's a full URL (http:// or https://), it's external
    if (style.match(/^https?:\/\//)) {
      return false;
    }

    // If it ends with .json and doesn't contain geolonia.com, it's likely external
    if (style.endsWith('.json')) {
      try {
        const absoluteUrl = new URL(style, location.href).href;
        return absoluteUrl.includes('geolonia.com');
      } catch {
        return false;
      }
    }

    // Otherwise, it's a Geolonia logical name like "geolonia/basic"
    return true;
  }
}

const keyring = new Keyring(); // Singleton

export { keyring };
