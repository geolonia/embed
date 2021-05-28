const AWS_SDK_URL = 'https://sdk.amazonaws.com/js/aws-sdk-2.775.0.min.js'
const AMPLIFY_URL = 'https://unpkg.com/@aws-amplify/core@3.7.0/dist/aws-amplify-core.min.js'

export class AmazonLocationServiceMapProvider {

  constructor(awsconfig = {}) {
    const { cognitoIdentityPoolId, mapName = 'explore.map' } = awsconfig
    if (!cognitoIdentityPoolId) {
      throw new Error('Invalid options. awsconfig.cognitoIdentityPoolId is required.')
    }
    this.cognitoIdentityPoolId = cognitoIdentityPoolId
    this.mapName = mapName
  }

  async _loadAwsSdk() {
    const AwsSdk = document.createElement('script')
    const Amplify = document.createElement('script')
    AwsSdk.setAttribute('src', AWS_SDK_URL)
    Amplify.setAttribute('src', AMPLIFY_URL)
    document.body.appendChild(AwsSdk)
    document.body.appendChild(Amplify)
  }

  _waitSDK({ timeout }) {
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

  async initMap(options) {
    this._loadAwsSdk()
    const { aws_amplify_core, AWS, geolonia } = await this._waitSDK({ timeout: 10000 })
    const { Signer } = aws_amplify_core

    AWS.config.region = this.cognitoIdentityPoolId.split(':')[0]
    const credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: this.cognitoIdentityPoolId,
    })
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

    return new geolonia.Map({
      minZoom: 1, // no 0/0/0 tile
      ...options,
      transformRequest,
    })
  }
}
