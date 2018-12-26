import mapboxgl from 'mapbox-gl'
import TilecloudControl from '@tilecloud/mbgl-tilecloud-control'

const navigationControl = new mapboxgl.NavigationControl()
const geolocationControl = new mapboxgl.GeolocateControl()
const tilecloudControl = new TilecloudControl()

export default [navigationControl, geolocationControl, tilecloudControl]
