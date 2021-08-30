const { PNG } = require('pngjs')

const pngDiff = (prevImage, nextImage) => {
  return new Promise(resolve => {
    const prev = PNG.sync.read(prevImage)
    const next = PNG.sync.read(nextImage)
    let totalDelta = 0
    if (prev.data.length !== next.data.length) {
      throw new Error(
        `image size mismatch: ${prev.width}x${prev.height} vs. ${next.width}x${next.height}`,
      )
    }
    const byteCount = prev.data.length
    const pixelCount = byteCount / 4
    for (let index = 0; index < byteCount; index += 4) {
      const prevA = prev.data[index + 3] / 255
      const nextA = next.data[index + 3] / 255
      let delta = 0
      delta += Math.abs(
        (prev.data[index] * prevA - next.data[index] * nextA) / 255,
      )
      delta += Math.abs(
        (prev.data[index + 1] * prevA - next.data[index + 1] * nextA) / 255,
      )
      delta += Math.abs(
        (prev.data[index + 2] * prevA - next.data[index + 2] * nextA) / 255,
      )
      totalDelta += delta / 3
    }
    const matchRate = (pixelCount - totalDelta) / pixelCount
    resolve(matchRate)
  })
}

const niceDiff = (img1, img2) => {
  return new Promise(resolve => {
    const png1 = PNG.sync.read(img1)
    const png2 = PNG.sync.read(img2)
    if (png1.data.length !== png2.data.length) {
      throw new Error(
        `image size mismatch: ${png1.width}x${png1.height} vs. ${png2.width}x${png2.height}`,
      )
    }
    const byteCount = png1.data.length
    const diff = {
      data: [],
      width: png1.width,
      height: png1.height,
    }
    for (let index = 0; index < byteCount; index += 4) {
      if (
        png1.data[index] !== png2.data[index] ||
        png1.data[index + 1] !== png2.data[index + 1] ||
        png1.data[index + 2] !== png2.data[index + 2]
      ) {
        // a bright marker
        diff.data.push(...[255, 120, 255, 255])
      } else {
        const darker = [png1.data[index], png1.data[index + 1], png1.data[index + 2]].map(p => Math.floor(p / 5))
        diff.data.push(...darker, 255)
      }
    }
    resolve(PNG.sync.write(diff))
  })
}

// eslint-disable-next-line no-unused-vars
const _test = async () => {
  const alfa = 255
  const img1 = PNG.sync.write({
    width: 2,
    height: 2,
    data: [
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
      [0, 0, 0],
    ].flatMap(rgb => [...rgb, alfa]),
  })
  const img2 = PNG.sync.write({
    width: 2,
    height: 2,
    data: [
      [255, 255, 255],
      [255, 255, 255],
      [255, 255, 255],
      [255, 255, 255],
    ].flatMap(rgb => [...rgb, alfa]),
  })
  const matchRate = await pngDiff(img1, img2)
  if (matchRate > 0) {
    throw new Error(`invalid match rate: ${matchRate}`)
  }
}

module.exports = { pngDiff, niceDiff }
