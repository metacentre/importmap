secret-stack plugin to read, upsert, and write an importmap

# API

```js
const key = 'pull-stream'
const value = 'https://cdn.skypack.dev/pull-stream'
sbot.importmap.upsert(key, value)
```

Result is written to `~/.ssb/public/importmap.json`

```json
{
  "imports": {
    "pull-stream": "https://cdn.skypack.dev/pull-stream"
  }
}
```
