const https = require('https');
const stream = require('stream');
const log = require('./logging')

const NOTIFY_ID = process.env.TG_CID;
const BOT_TOKEN = process.env.TG_TOKEN;

function sendMessage (message, logger) {
  return new Promise((resolve, reject) => {
    let options = {
      hostname: "api.telegram.org",
      port: 443,
      path: "/bot" + BOT_TOKEN + "/sendMessage?chat_id=" + NOTIFY_ID + "&text=" + encodeURIComponent(message),
      method: "POST"
    }

    const request = https.request(options);
    request.end();

    request.on('error', reject)

    request.on('response', (response) => {
      //logger.info('Status code: ' + response.statusCode, { location: 'TelegramLogger' });
      response.setEncoding('utf8');
      response.on('data', (chunk) => {
        //logger.verbose(chunk, { location: 'TelegramLogger' })
      });
      resolve()
    });
  })
}

class TelegramLoggerStream extends stream.Writable {
  constructor () {
    super()
  }
  _write (chunk, encoding, done) {
    sendMessage(chunk, log).then(done).catch(done)
  }
}

module.exports = {
  sendMessage,
  TelegramLoggerStream
}