import urlParse from 'url-parse';

class Keyring {
  #apiKey: string;
  #stage: string;

  constructor() {
    this.#apiKey = window.geolonia._apiKey ?? 'no-api-key';
    this.#stage = window.geolonia._stage ?? 'dev';
  }

  /**
   * @returns API key. Default: 'no-api-key'
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
    if (!window.geolonia) {
      window.geolonia = {};
    }

    this.#apiKey = window.geolonia._apiKey = key;
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
    if (!window.geolonia) {
      window.geolonia = {};
    }

    this.#stage = window.geolonia._stage = stage;
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
      const { pathname, query } = urlParse(script.src);
      const q = new URLSearchParams(query.replace(/^\?/, ''));

      if (q.get('geolonia-api-key')) {
        this.#apiKey = q.get('geolonia-api-key') || 'YOUR-API-KEY';

        const res = pathname.match( /^\/(v[0-9.]+)\/embed/ );
        if (res && res[1]) {
          this.#stage = res[1];
        }

        break;
      }
    }

    if (this.#apiKey && this.#stage) {
      if (!window.geolonia) {
        window.geolonia = {};
      }
      window.geolonia._apiKey ||= this.#apiKey;
      window.geolonia._stage ||= this.#stage;
    } else {
      if (!this.#apiKey && !this.#stage) {
        throw new Error('Cannot load API key and stage.');
      } else if (this.#apiKey && !this.#stage) {
        throw new Error('Cannot load stage.');
      } else { // if (!this.#apiKey && this.#stage)
        throw new Error('Cannot load API key.');
      }
    }
  }
}

const keyring = new Keyring(); // Singleton

export { keyring };
