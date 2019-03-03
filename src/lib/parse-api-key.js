import urlParse from 'url-parse'
import qs from 'querystring'

export default document => {
  const scripts = document.getElementsByTagName('script')
  for (const script of scripts) {
    const { query } = urlParse(script.src)
    const { apiKey, tilecloud } = qs.parse(query.replace(/^\?/, ''))
    if (tilecloud === 'true') {
      return apiKey
    }
  }
}
