
window.URL.createObjectURL ||= (_: Blob | MediaSource) => 'dummy'; // To prevent `TypeError: window.URL.createObjectURL is not a function`
import GeoloniaMap from './geolonia-map'; // GeoloniaMap のインポート


describe('GeoloniaMap.loadImage', () => {

  beforeEach(() => {
  });


  afterEach(() => {
    // sinon.restore();
  });

  it('should call super.loadImage and resolve with expected image data', async () => {

    const map = new GeoloniaMap({
      container: document.createElement('div'),
      style: 'https://example.com/style.json',
    });

  });


  // it('should call callback with image data if callback is provided', (done) => {
  //   const url = 'https://example.com/image.png';
  //   const callback = sinon.spy((error, image, expiry) => {
  //     expect(error).to.be.null;
  //     expect(image).to.equal('mockedImageData');
  //     expect(expiry.cacheControl).to.equal('mockedCacheControl');
  //     expect(expiry.expires).to.equal('mockedExpires');
  //     done();
  //   });

  //   geoloniaMap.loadImage(url, callback);
  // });
});
