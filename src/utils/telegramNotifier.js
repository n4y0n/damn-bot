//@ts-check
const stream = require('stream');
const log = require('./logging')
const RestClient = require('../lib/RestClient')

const client = new RestClient('https://api.telegram.org')

const NOTIFY_ID = process.env.TG_CID;
const BOT_TOKEN = process.env.TG_TOKEN;

async function sendMessage (message, logger) {
    return await client.Post("/bot" + BOT_TOKEN + "/sendMessage", null, {
        chat_id: NOTIFY_ID,
        text: message.toString(),
    })
}

class TelegramLoggerStream extends stream.Writable {
    constructor () {
        super()
    }
    _write (chunk, encoding, done) {
        sendMessage(chunk, log).then(r => done()).catch(e => {
            log.error(e, { location: "TelegramLoggerStream" })
            done()
        })
    }
}

module.exports = {
    sendMessage,
    TelegramLoggerStream
}
