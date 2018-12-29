import 'mapbox-gl/dist/mapbox-gl.css'
import osmBlight from './styles/osm-blight/style'

export const MAP_TYPES = {
  BASIC: 'tilecloud-basic',
}

export const generateStyles = {
  [MAP_TYPES.BASIC]: apiKey => osmBlight(apiKey),
}
