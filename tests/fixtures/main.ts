import geolonia, { Map as GeoloniaMap } from "../../src/index";

class SmartCitySDK {
  map: GeoloniaMap;

  constructor(container: string) {
    console.log("SmartCitySDK is loaded.");

    this.map = new geolonia.Map({
      container,
    });
  }
}

export default SmartCitySDK;
