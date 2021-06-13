const fs = require('fs')
const { join } = require('path')
const mkdirp = require('mkdirp')
const pkg = require('./package.json')

module.exports = {
  name: 'importmap',
  version: pkg.version,
  manifest: {
    read: 'sync',
    write: 'sync',
    upsert: 'sync'
  },
  init(api, config) {
    console.log(`[${pkg.name}] v${pkg.version} init`)

    /** create public path to hold importmap */
    mkdirp.sync(join(config.path, 'public'))
    const importmapPath = join(config.path, 'public', 'importmap.json')

    const read = () => {
      try {
        const importmap = require(importmapPath)
        return importmap
      } catch (error) {
        throw new Error(`Error reading importmap from disk ${error}`)
      }
    }

    const write = importmap => {
      try {
        JSON.parse(JSON.stringify(importmap))
      } catch (error) {
        throw new Error('importmap is not valid json')
      }
      try {
        console.log('attempting to write importmap to ', importmapPath)
        fs.writeFileSync(importmapPath, JSON.stringify(importmap, null, 2))
      } catch (error) {
        throw new Error('error writing importmap to disk')
      }
      return true
    }

    const upsert = (key, value) => {
      let importmap
      /** create blank importmap if none on disk */
      try {
        importmap = read()
      } catch (error) {
        importmap = { imports: {} }
      }

      importmap.imports[key] = value
      write(importmap)
      return importmap
    }

    return {
      read,
      write,
      upsert
    }
  }
}
