import urlParse from 'url-parse'
import { parse } from 'querystring'

export default document => {
  const scripts = document.getElementsByTagName('script')
  for (const script of scripts) {
    const { query } = urlParse(script.src)
    const q = parse(query.replace(/^\?/, ''))
    if (q['tilecloud-api-key']) {
      return q['tilecloud-api-key']
    }
  }

  return null
}
