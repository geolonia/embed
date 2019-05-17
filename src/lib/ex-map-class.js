export const mapRenderingQueue = []

export class MapBeforeLoad {
  constructor(...args) {
    return new Promise((resolve, reject) =>
      mapRenderingQueue.push({ args, resolve, reject }),
    )
  }
}

export const MapAfterLoad = MbglMap =>
  class {
    constructor(...args) {
      return new Promise((resolve, reject) => {
        try {
          return resolve(new MbglMap(...args))
        } catch (e) {
          reject(e)
        }
      })
    }
  }
