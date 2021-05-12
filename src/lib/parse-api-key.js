import urlParse from 'url-parse'
import querystring from 'querystring'

export default document => {
  if (window.geolonia.apiKey && window.geolonia.stage) {
    return {
      key: window.geolonia.apiKey,
      stage: window.geolonia.stage,
    }
  }

  const scripts = document.getElementsByTagName('script')
  const params = {
    key: 'no-api-key',
    stage: 'dev',
  }

  for (const script of scripts) {
    const { pathname, query } = urlParse(script.src)
    const q = querystring.parse(query.replace(/^\?/, ''))

    if (q['geolonia-api-key']) {
      params.key = q['geolonia-api-key'] || 'YOUR-API-KEY'

      const res = pathname.match( /^\/(v[0-9.]+)\/embed/ )
      if (res && res[1]) {
        params.stage = res[1]
      }

      break
    }
  }

  window.geolonia.apiKey = params.key
  window.geolonia.stage = params.stage

  return params
}
