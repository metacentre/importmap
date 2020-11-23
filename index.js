const fs = require('fs')
const { join } = require('path')

module.exports = {
  name: 'importmap',
  version: '0.0.1',
  manifest: {
    write: 'sync',
    serve: 'sync'
  },
  init: (api, config) => {
    return {
      /** write importmap object to disk at database path */
      write: importmap => {
        const path = join(config.path, 'importmap.json')
        try {
          JSON.parse(JSON.stringify(importmap))
        } catch (error) {
          throw new Error('importmap is not valid json')
        }
        try {
          fs.writeFileSync(path, JSON.stringify(importmap))
        } catch (error) {
          throw new Error('error writing importmap to disk')
        }
        return true
      },
      serve: () => {
        if (!api.ws) {
          throw new Error(
            'importmap plugin requires ssb-ws plugin to be loaded'
          )
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
    }
  }
}
