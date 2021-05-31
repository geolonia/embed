import 'whatwg-fetch'
import { getContainer } from '../util'
import GeoloniaControl from '@geolonia/mbgl-geolonia-control'

const AWS_SDK_URL = 'https://sdk.amazonaws.com/js/aws-sdk-2.775.0.min.js'
const AMPLIFY_URL = 'https://unpkg.com/@aws-amplify/core@3.7.0/dist/aws-amplify-core.min.js'
const STYLE_URL = 'https://geolonia.github.io/embed/amzn-loc-style.json'
export class AmazonLocationServiceMapProvider {

  constructor(awsconfig = {}) {
    const { cognitoIdentityPoolId, mapName = 'explore.map', region = 'ap-northeast-1' } = awsconfig
    if (!cognitoIdentityPoolId) {
      throw new Error('Invalid options. awsconfig.cognitoIdentityPoolId is required.')
    }
    this.cognitoIdentityPoolId = cognitoIdentityPoolId
    this.mapName = mapName
    this.region = region
  }

  /**
   * Load AWS SDK et al. if not exists.
   * @param {{timeout}} 
   * @returns Promise<{aws_amplify_core, AWS, geolonia}>
   */
  _loadAwsSdk({ timeout }) {
    const { aws_amplify_core, AWS, geolonia } = window
    if (aws_amplify_core && AWS && geolonia) {
      return Promise.resolve({ aws_amplify_core, AWS, geolonia })
    } else {
      // Dynamic loading
      const AwsSdk = document.createElement('script')
      const Amplify = document.createElement('script')
      AwsSdk.setAttribute('src', AWS_SDK_URL)
      Amplify.setAttribute('src', AMPLIFY_URL)
      document.body.appendChild(AwsSdk)
      document.body.appendChild(Amplify)

      // Wait until ready
      return new Promise((resolve, reject) => {
        let isTimeout = false
        setTimeout(() => { isTimeout = true }, timeout)
        const timerId = setInterval(() => {
          const { aws_amplify_core, AWS, geolonia } = window
          if (aws_amplify_core && AWS && geolonia) {
            clearInterval(timerId)
            return resolve({ aws_amplify_core, AWS, geolonia })
          } else if (isTimeout) {
            clearInterval(timerId)
            return reject(new Error('Failed to load the AWS SDK.'))
          }
        }, 50)
      })
    }
  }

  _fetchStyle(url) {
    return fetch(url).then(res => res.json())
  }

  async initMap(options) {
    const { aws_amplify_core, AWS, geolonia } = await this._loadAwsSdk({ timeout: 10000 })
    
    // Sign with AWS SDK
    const { Signer } = aws_amplify_core
    const cognitoRegion = this.cognitoIdentityPoolId.split(':')[0]
    const credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: this.cognitoIdentityPoolId,
    }, { region: cognitoRegion })
    await credentials.getPromise()
    const transformRequest = (url, resourceType) => {
      if (url.includes('amazonaws.com')) {
        // only sign AWS requests (with the signature as part of the query string)
        return {
          url: Signer.signUrl(url, {
            access_key: credentials.accessKeyId,
            secret_key: credentials.secretAccessKey,
            session_token: credentials.sessionToken,
          }),
        }
      }

      // Additional transformation
      if (typeof options.transformRequest === 'function') {
        return options.transformRequest(url, resourceType)
      } else {
        return { url }
      }
    }

    const mapOptions = {
      minZoom: 1, // no 0/0/0 tile
      ...options,
      transformRequest,
    }

    // override style if not specified
    const container = getContainer(options.container)
    if (container && !container.dataset.style) {
      const style = await this._fetchStyle(STYLE_URL)
      style.sources.omv.tiles = style.sources.omv.tiles.map(url => {
        return url
          .replace('%MAP_NAME%', this.mapName)
          .replace('%REGION%', this.region)
      })
      mapOptions.style = style
    }

    const map = new geolonia.Map(mapOptions)
    try {
      map._controls.forEach(control => {
        if (control instanceof GeoloniaControl) {
          map.removeControl(control)
        }
      })    
    } catch (error) {
      // nothing to do
    }

    return map
  }
}
