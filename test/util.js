const { PNG } = require('pngjs')

const isWhiteout = image => {
  return new Promise((resolve, reject) => {
    try {
      const png = PNG.sync.read(image)
      let whiteCount = 0
      for (let index = 0; index < png.data.length; index += 4) {
        if (
          png.data[index] > 239 &&
          png.data[index + 1] > 239 &&
          png.data[index + 2] > 239
        ) {
          whiteCount++
        }      
      }
      resolve(4 * whiteCount / png.data.length)

      
    } catch (error) {
      reject(error)
    }
  })
}

module.exports = { isWhiteout }
