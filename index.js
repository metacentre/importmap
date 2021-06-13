const fs = require('fs')
const { join } = require('path')
const mkdirp = require('mkdirp')

module.exports = {
  name: 'importmap',
  version: require('./package.json').version,
  manifest: {
    read: 'sync',
    write: 'sync',
    upsert: 'sync'
  },
  init: (api, config) => {
    console.log('[@metacentre/importmap] init')
    console.log('[@metacentre/importmap] config', config)

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

    const upsert = entry => {
      /** entry comes from microfrontends.config.json
       *  they look like this
        {
          "scope": "@metacentre",
          "name": "styleguide",
          "route": "/microfrontends/styleguide/",
          "file": "metacentre-styleguide.js"
        }
      */
      let importmap
      /** create blank importmap if none on disk */
      try {
        importmap = read()
      } catch (error) {
        importmap = { imports: {} }
      }

      const { protocol, host, port } = config.httpserver

      const server =
        host === 'localhost'
          ? `${protocol}${'://'}${host}:${port}` // locally
          : `${protocol}${'://'}${host}` // production

      const { scope, name, route, file } = entry
      const scopeName = join(scope, name)
      const url = join(server, route, file).replace(':/', '://')
      importmap.imports[scopeName] = url
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
