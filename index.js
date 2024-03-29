const fs = require('fs')
const through = require('through2').obj
const clone = require('clone')
const jsonStringify = require('json-stable-stringify')

/*  export a Browserify plugin  */
module.exports = function (browserify, pluginOpts = {}) {
  // setup the plugin in a re-bundle friendly way
  browserify.on('reset', setupPlugin)
  setupPlugin()

  function setupPlugin () {
    const { filename } = pluginOpts
    if (!filename) {
      throw new Error('deps-dump: no filename specified')
    }
    const allDeps = {}
    browserify.pipeline.splice('debug', 0, through((dep, _, cb) => {
      const metaData = clone(dep)
      allDeps[metaData.id] = metaData
      cb(null, dep)
    }, (cb) => {
      const serialized = jsonStringify(allDeps, { space: 2 })
      console.warn(`deps-dump - writing to ${filename}`)
      fs.writeFile(filename, serialized, cb)
    }))
  }
}