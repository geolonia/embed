
window.URL.createObjectURL ||= (_: Blob | MediaSource) => 'dummy'; // To prevent `TypeError: window.URL.createObjectURL is not a function`
import GeoloniaMap from './geolonia-map';


describe('GeoloniaMap.loadImage', () => {

  beforeEach(() => {
  });


  afterEach(() => {
  });

  it('should call super.loadImage and resolve with expected image data', async () => {

    const map = new GeoloniaMap({
      container: document.createElement('div'),
      style: 'https://example.com/style.json',
    });

  });
});
