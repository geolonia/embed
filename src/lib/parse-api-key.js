import urlParse from 'url-parse'
import querystring from 'querystring'

export default document => {
  const scripts = document.getElementsByTagName('script')
  for (const script of scripts) {
    const { query } = urlParse(script.src)
    const q = querystring.parse(query.replace(/^\?/, ''))
    if (q['tilecloud-api-key']) {
      return q['tilecloud-api-key']
    }
  }

  return null
}
