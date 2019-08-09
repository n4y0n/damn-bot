const https = require('https');
const log = require('./logging')

const NOTIFY_ID = process.env.TG_CID;
const BOT_TOKEN = process.env.TG_TOKEN;

module.exports = function sendMessage (message) {
  let options = {
    hostname: "api.telegram.org",
    port: 443,
    path: "/bot" + BOT_TOKEN + "/sendMessage?chat_id="+NOTIFY_ID+"&text="+encodeURIComponent(message),
    method: "POST"
  }

  const request = https.request(options);
  request.end();

  request.on('response', function (response) {
    log.info('Status code: ' + response.statusCode, { location: 'TelegramLogger' });
    response.setEncoding('utf8');
    response.on('data', function (chunk) {
      log.verbose(chunk, { location: 'TelegramLogger' });
    });
  });
}