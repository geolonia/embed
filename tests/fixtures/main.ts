import geolonia, { Map as GeoloniaMap } from "../../src/index";

class SmartCitySDK {
  map: GeoloniaMap;

  constructor(container: string) {
    console.log("SmartCitySDK is loaded.");

    geolonia.setApiKey("YOUR-API-KEY");
    geolonia.setStage("dev")

    for (const el of document.getElementsByClassName(container)) {
      this.map = new geolonia.Map({
        container: el as HTMLElement,
      });
    }
  }
}

new SmartCitySDK("geolonia");
