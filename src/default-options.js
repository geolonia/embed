export default {
  mapOptions: apiKey => ({
    style: `https://tilecloud.github.io/tiny-tileserver/style.json?apiKey=${apiKey}`,
    attributionControl: true,
    localIdeographFontFamily: 'sans-serif',
  }),
  lazyOptions: {
    buffer: 0,
  },
}
