class Keyring {
  #apiKey: string;
  #stage: string;

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
    const scripts: HTMLScriptElement[] | HTMLCollectionOf<HTMLScriptElement> = doc.currentScript ?
      [doc.currentScript as HTMLScriptElement]
      :
      doc.getElementsByTagName('script');

    for (const script of scripts) {
      const url = new URL(
        (
          script.src.startsWith('https://') ||
          script.src.startsWith('http://') ||
          script.src.startsWith('//')
        ) ? script.src : `https://${location.host}/${script.src}`);
      const apiKey = url.searchParams.get('geolonia-api-key');

      if (apiKey) {
        this.#apiKey = apiKey;

        const res = url.pathname.match( /^\/(v[0-9.]+)\/embed/ );
        if (res && res[1]) {
          this.#stage = res[1];
        }

        break;
      }
    }

    if (!this.#stage) {
      this.#stage = 'dev';
    }

    if (!this.#apiKey) {
      throw new Error('Cannot load API key.');
    }
  }

  /** Reset API key and stage for testing purpose */
  public reset() {
    this.#apiKey = undefined;
    this.#stage = undefined;
  }
}

const keyring = new Keyring(); // Singleton

export { keyring };
