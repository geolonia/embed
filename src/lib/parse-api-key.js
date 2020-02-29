import urlParse from 'url-parse'
import querystring from 'querystring'

export default document => {
  const scripts = document.getElementsByTagName('script')
  const params = {
    key: 'YOUR-API-KEY',
    stage: 'dev',
  }

  for (const script of scripts) {
    const { pathname, query } = urlParse(script.src)
    const q = querystring.parse(query.replace(/^\?/, ''))

    if (q['geolonia-api-key'] || q['tilecloud-api-key']) {
      params.key = q['geolonia-api-key'] || q['tilecloud-api-key'] || 'YOUR-API-KEY',
      params.stage = (pathname.match( /^\/v1/ )) ? 'v1' : 'dev'

      break
    }
  }

  return params
}
