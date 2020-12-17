const fs = require('fs')
const { join } = require('path')

module.exports = {
  name: 'importmap',
  version: require('./package.json').version,
  manifest: {
    read: 'sync',
    write: 'sync',
    upsert: 'sync',
    serve: 'sync'
  },
  init: (api, config) => {
    const read = () => {
      const path = join(config.path, 'importmap.json')
      try {
        const importmap = require(path)
        return importmap
      } catch (error) {
        throw new Error(`Error reading importmap from disk ${error}`)
      }
    }

    const write = importmap => {
      const path = join(config.path, 'importmap.json')
      try {
        JSON.parse(JSON.stringify(importmap))
      } catch (error) {
        throw new Error('importmap is not valid json')
      }
      try {
        fs.writeFileSync(path, JSON.stringify(importmap, null, 2))
      } catch (error) {
        throw new Error('error writing importmap to disk')
      }
      return true
    }

    const upsert = entry => {
      let importmap
      /** create blank importmap if none on disk */
      try {
        importmap = read()
      } catch (error) {
        importmap = { imports: {} }
      }

      const { protocol, host, port } = config.httpserver
      const server = `${protocol}${'://'}${host}:${port}`
      const { scope, name, route, file } = entry
      const scopeName = join(scope, name)
      const url = join(server, route, file).replace(':/', '://')
      importmap.imports[scopeName] = url
      write(importmap)
      return importmap
    }
    const serve = () => {
      if (!api.ws) {
        throw new Error('importmap plugin requires ssb-ws plugin to be loaded')
      }
      /** load importmap.json from database path */
      const path = join(config.path, 'importmap.json')
      let importmap
      try {
        importmap = fs.readFileSync(path)
        importmap = JSON.parse(importmap)
      } catch (error) {
        throw new Error('importmap is missing or not valid json')
      }
      /** serve importmap */
      api.ws.use((req, res, next) => {
        if (req.url === '/importmap') {
          res.setHeader('Content-Type', 'application/json')
          res.setHeader('Access-Control-Allow-Origin', '*') // todo: tighten this up perhaps?
          res.end(JSON.stringify(importmap, null, 2))
        } else next()
      })
    }

    return {
      read,
      write,
      upsert,
      serve
    }
  }
}
