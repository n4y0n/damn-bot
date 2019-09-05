//@ts-check
const stream = require('stream');

const RestClient = require('../lib/RestClient')

class TelegramLoggerStream extends stream.Writable {
    constructor (token, chatid) {
        super()
        this._chatid = chatid
        this.rclient = new RestClient(`https://api.telegram.org/bot${token}`)
    }

    get ChatID () {
        return this._chatid
    }

    get RestClient () {
        return this.rclient
    }

    _write (chunk, encoding, done) {
        this.rclient.Post('/sendMessage', null, {
            chat_id: this.ChatID,
            text: chunk.toString(),
        }).then(() => done()).catch(done)
    }
}

module.exports = {
    TelegramLoggerStream
}
