//@ts-check
const fs = require('fs')
const path = require('path')

let cache = {}

module.exports = function (...pathArgs) {
    return new Promise((resolve, reject) => {
        const keyPath = path.join(...pathArgs)
        if (cache[keyPath]) return resolve(cache[keyPath])
        fs.readFile(keyPath, function (err, data) {
            if (err) return reject(err)
            cache[keyPath] = data
            resolve(data.toString())
        })
    })
}
