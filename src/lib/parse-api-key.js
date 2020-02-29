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
      params.key = q['geolonia-api-key'] || q['tilecloud-api-key'] || 'YOUR-API-KEY'

      const res = pathname.match( /^\/(v[0-9\.]+)\/embed/ )
      if (res) {
        params.stage = res[1]
      }

      break
    }
  }

  return params
}
