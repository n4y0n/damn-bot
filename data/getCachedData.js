const fs = require('fs')

let cache = {}

module.exports = async function (path) {
  if (cache[path]) return cache[path]
  let data = fs.readFileSync(path)
  cache[path] = data
  return data
}