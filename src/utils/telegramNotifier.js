//@ts-check
const stream = require('stream');

class TelegramLoggerStream extends stream.Writable {
    constructor () {
        super()
    }
    _write (chunk, encoding, done) {
        console.log(chunk.toString())
        done()
    }
}

module.exports = {
    TelegramLoggerStream
}
