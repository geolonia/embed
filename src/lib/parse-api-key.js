import urlParse from 'url-parse'
import querystring from 'querystring'

export default document => {
  const scripts = document.getElementsByTagName('script')
  for (const script of scripts) {
    const { query } = urlParse(script.src)
    const q = querystring.parse(query.replace(/^\?/, ''))
    return q['tilecloud-api-key'] || null
  }

  return null
}
