import { registerPluginHook, applyPlugins } from './plugin'
import assert from 'assert'

describe('tests for plugin registration.', () => {
  it('should work as filter at "before-map".', () => {
    const plugin = (container, atts, options) => {
      return { ...options, pluginloaded: true }
    }
    registerPluginHook('before-map', plugin)
    const nextOptions = applyPlugins('before-map', [{}, {}, { pluginloaded: false }])
    assert.strictEqual(true, nextOptions.pluginloaded)
  })

  it('should work as reduce filter at "before-map".', () => {
    const countUpPlugin = (container, atts, options) => {
      return { ...options, count: options.count ? options.count + 1 : 1 }
    }
    registerPluginHook('before-map', countUpPlugin)
    registerPluginHook('before-map', countUpPlugin)
    const nextOptions = applyPlugins('before-map', [{}, {}, {}])
    assert.strictEqual(2, nextOptions.count)
  })
})
