import urlParse from 'url-parse'
import qs from 'querystring'

const availableHosts = [
  'tilecloud.io',
  'tilecloud.github.io',
  /^.+\.tilecloud.io$/,
]

const isKnownHost = host => {
  for (const availableHost of availableHosts) {
    if (availableHost === host) {
      return true
    } else if (availableHost instanceof RegExp && availableHost.test(host)) {
      return true
    }
  }
}

export default document => {
  const scripts = document.getElementsByTagName('script')
  for (const script of scripts) {
    const { query, host } = urlParse(script.src)
    const { key } = qs.parse(query.replace(/^\?/, ''))
    if (isKnownHost(host)) {
      console.log(key)
      return key || null
    }
  }

  return null
}
