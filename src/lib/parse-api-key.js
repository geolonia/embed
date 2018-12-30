import urlParse from 'url-parse'
import qs from 'querystring'

const allowedHosts = [
  '127.0.0.1',
  'localhost',
  'tilecloud.io',
  'github.tilecloud.io',
]

export default () => {
  const scripts = document.getElementsByTagName('script')
  for (const script of scripts) {
    const { hostname, query } = urlParse(script.src)
    const { apiKey, tilecloud } = qs.parse(query.replace(/^\?/, ''))
    if (allowedHosts.includes(hostname) && tilecloud === 'true') {
      return apiKey
    }
  }
}
