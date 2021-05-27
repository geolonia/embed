/**
 * store plugin array with [name] key
 */
const pluginRegistrationMap = {}

/**
 * plugin reduce definitions
 */
const pluginReducers = {
  'before-map': {
    func: (target, atts) => (prevOptions, pluginFunc) => {
      const nextOptions = pluginFunc(target, atts, prevOptions)
      return nextOptions
    },
    init: (_target, _atts, options) => options,
  },
  // sipmle action, no side effects
  default: {
    func: (map, target, atts) => (prev, pluginFunc) => { pluginFunc(map, target, atts) },
    init: () => void 0,
  },
}

/**
 * 
 * @param {string} name plugin hook point name
 * @param {*} plugin the plugin
 */
export const registerPluginHook = (name, plugin) => {
  if (pluginRegistrationMap[name]) {
    pluginRegistrationMap[name].push(plugin)
  } else {
    pluginRegistrationMap[name] = [plugin]
  }
}

/**
 * 
 * @param {string} name plugin hook point name
 * @param  {any[]} args plugin arguments
 * @returns reduced values for multiple filter plugins
 */
export const applyPlugins = (name, args) => {
  const pluginRegistrations = pluginRegistrationMap[name] || []
  const pluginReducer = pluginReducers[name] || pluginReducers.default
  const reduceFunction = pluginReducer.func(...args)
  const reduceInitialValue = pluginReducer.init(...args)
  return pluginRegistrations.reduce(reduceFunction, reduceInitialValue)
}
