const fs = require('fs')
const { join } = require('path')
const mkdirp = require('mkdirp')
const pkg = require('./package.json')
const debug = require('debug')('plugins:importmap')

module.exports = {
  name: 'importmap',
  version: pkg.version,
  manifest: {
    read: 'sync',
    write: 'sync',
    upsert: 'sync'
  },
  init(api, config) {
    debug(`[${pkg.name}] v${pkg.version} init`)

    let importmap

    /** create public path to hold importmap */
    mkdirp.sync(join(config.path, 'public'))
    const importmapPath = join(config.path, 'public', 'importmap.json')

    const read = () => {
      try {
        const importmapDisk = require(importmapPath)
        importmap = importmapDisk
        return importmap
      } catch (error) {
        throw new Error(`Error reading importmap from disk ${error}`)
      }
    }

    const write = importmapToWrite => {
      try {
        JSON.parse(JSON.stringify(importmapToWrite))
      } catch (error) {
        throw new Error('importmap is not valid json')
      }
      try {
        const pretty = JSON.stringify(importmap, null, 2)
        debug('Writing importmap to ', importmapPath)
        debug(pretty)
        fs.writeFileSync(importmapPath, pretty)
      } catch (error) {
        throw new Error('error writing importmap to disk')
      }
      return true
    }

    const upsert = (key, value) => {
      let importmapExisting
      /** create blank importmap if none on disk */
      try {
        importmapExisting = read()
      } catch (error) {
        importmapExisting = importmap
      }
      importmapExisting.imports[key] = value
      write(importmapExisting)
      return importmapExisting
    }

    /** create blank importmap if none on disk */
    try {
      importmap = read()
    } catch (error) {
      importmap = { imports: {} }
    }

    return {
      read,
      write,
      upsert
    }
  }
}
