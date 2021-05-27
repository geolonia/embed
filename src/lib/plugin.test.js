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
})
