//@ts-check
require('dotenv').config()

//#region Imports
const winston = require('winston')
const logger = require('./utils/logging')
const tlog = require("./utils/telegramNotifier")

const initCli = require('./utils/termial-cli')

const MyBot = require('./DBot')

const CommandProcessorComponent = require('./components/processors/CommandProcessorComponet')
const LogMessageProcessorComponent = require('./components/processors/LogMessageProcessorComponent')
const CiaoBoccProcessorComponent = require('./components/processors/CiaoBoccProcessorComponent')
//#endregion

//#region ***** Variables *****
const botChannel = '538747728763682817'
// Telegram logger
const NOTIFY_ID = process.env.TG_CID;
const BOT_TOKEN = process.env.TG_TOKEN;
//#endregion

//#region ***** Setup *****
if (NOTIFY_ID && BOT_TOKEN) {
    logger.add(new winston.transports.Stream({
        level: process.env.NODE_ENV === "production" ? "warn" : "debug",
        stream: new tlog.TelegramLoggerStream(BOT_TOKEN, NOTIFY_ID)
    }))
}

const start = Date.now()
let bot = new MyBot({
    disabledEvents: ['TYPING_START'],
    messageCacheMaxSize: 25,
    messageCacheLifetime: 120,
    messageSweepInterval: 120
})

// Order is important in adding processor-components for handling of messages
// if a component declare that it has already handled a message
// other components will not see the after-mentioned message

// Logging never handle
// bot.addComponent(new LogMessageProcessorComponent())

// Command handle only if it is a command
bot.addComponent(
    new CommandProcessorComponent('-').
        addCommand(require('./commands/Clear.command')).
        addCommand(require('./commands/Help.command')).
        addCommand(require('./commands/Mono.command')).
        addCommand(require('./commands/Mc.command'))
)

// Ciao Bocc handles everything
bot.addComponent(new CiaoBoccProcessorComponent())

//#region ***** Bot hooks *****
bot.on('ready', () => {
    logger.info('Bot took: ' + (Date.now() - start) + 'ms', { location: 'Index' })
    initCli(bot, botChannel)
})

bot.on('error', err => {
    logger.error(err.message, { location: 'Index' })
    process.exit(-1)
})
//#endregion

//#endregion

// ***** Start bot *****
bot.login(process.env.TOKEN)
    .then(token => logger.info('Ok', { location: 'Index' }))
    .catch(err => {
        logger.error(err.message, { location: 'Index' })
        process.exit(-1)
    })
