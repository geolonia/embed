const { PNG } = require('pngjs')

const pngDiff = (prevImage, nextImage) => {
  return new Promise(resolve => {
    const prev = PNG.sync.read(prevImage)
    const next = PNG.sync.read(nextImage)
    let totalDelta = 0
    if (prev.data.length !== next.data.length) {
      throw new Error(`image size mismatch: ${prev.width}x${prev.height} vs. ${next.width}x${next.height}`)
    }
    const pixelCount = prev.data.length
    for (let index = 0; index < pixelCount; index += 4) {
      const prevA = prev.data[index + 3] / 255
      const nextA = next.data[index + 3] / 255
      let delta = 0
      delta += Math.abs((prev.data[index] * prevA - next.data[index] * nextA) / 255)
      delta += Math.abs((prev.data[index + 1] * prevA - next.data[index + 1] * nextA) / 255)
      delta += Math.abs((prev.data[index + 2] * prevA - next.data[index + 2] * nextA) / 255)
      totalDelta += delta / 3
    }
    const matchRate = (pixelCount - totalDelta) / pixelCount
    resolve(matchRate)
  })
}

module.exports = { pngDiff }
