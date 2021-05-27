import { registerPluginHook, applyPlugins, clearRegistraitions } from './plugin'
import assert from 'assert'

describe('tests for plugin registration.', () => {

  beforeEach(() => clearRegistraitions())

  it('should work as filter at "before-map".', async () => {
    const plugin = (container, atts, options) => {
      return { ...options, pluginloaded: true }
    }
    registerPluginHook('before-map', plugin)
    const nextOptions = await applyPlugins('before-map', [{}, {}, { pluginloaded: false }])
    assert.strictEqual(true, nextOptions.pluginloaded)
  })

  it('should work as reduce filter at "before-map".', async () => {
    const countUpPlugin = (container, atts, options) => {
      return { ...options, count: options.count ? options.count + 1 : 1 }
    }
    registerPluginHook('before-map', countUpPlugin)
    registerPluginHook('before-map', countUpPlugin)
    const nextOptions = await applyPlugins('before-map', [{}, {}, {}])
    assert.strictEqual(2, nextOptions.count)
  })

  it('should work as async reduce filter at "before-map".', async () => {
    const countUpPlugin = async (container, atts, options) => {
      return { ...options, count: options.count ? options.count + 1 : 1 }
    }
    registerPluginHook('before-map', countUpPlugin)
    registerPluginHook('before-map', countUpPlugin)
    const nextOptions = await applyPlugins('before-map', [{}, {}, {}])
    assert.strictEqual(nextOptions.count, 2)
  })

  it('should skip if a plugin crashes.', async () => {
    const noCrashPlugin = (container, atts, options) => {
      return { ...options, works: true }
    }
    const asyncCrashPlugin = async () => {
      throw new Error('crash')
    }
    const crashPlugin = () => {
      throw new Error('crash')
    }
    registerPluginHook('before-map', noCrashPlugin)
    registerPluginHook('before-map', asyncCrashPlugin)
    registerPluginHook('before-map', crashPlugin)
    const nextOptions = await applyPlugins('before-map', [{}, {}, {}])
    assert.strictEqual(nextOptions.works, true)
  })
})
