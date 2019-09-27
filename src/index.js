//@ts-check
require('dotenv').config()

//#region Imports
const winston = require('winston')
const logger = require('./utils/logging')
const MainBus = require('./lib/MainEventsBus')
const tlog = require("./utils/telegramNotifier")

const initCli = require('./utils/termial-cli')

const MyBot = require('./BotClass')

const CommandProcessorModule = require('./modules/CommandProcessorModule')
const CiaoBoccModule = require('./modules/CiaoBoccModule')
const DispatcherModuleBuilder = require('./modules/DispatcherModuleBuilder')()
//#endregion

// Telegram logger
const NOTIFY_ID = process.env.TG_CID;
const BOT_TOKEN = process.env.TG_TOKEN;

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
    .registerOnReady(MainBus)


DispatcherModuleBuilder
    .commandsPrefix('-')
    .build()
    .register(MainBus)


// Order is important in adding processor-components for handling of messages
// if a component declare that it has already handled a message
// other components will not see the after-mentioned message

// Logging never handle
// new LogMessageModule().
//  register(MainBus)

// Command handle only if it is a command

new CommandProcessorModule('-')
    .register(MainBus)
    .autoload(__dirname + '/commands')

// Ciao Bocc handles everything
new CiaoBoccModule()
    .register(MainBus)

//#region ***** Bot hooks *****
MainBus.on('bot-ready', (bot) => {
    logger.info('Bot took: ' + (Date.now() - start) + 'ms', { location: 'Index' })
    initCli(bot, '538747728763682817')
})

MainBus.on('bot-error', err => {
    logger.error(err.message, { location: 'Index' })
    process.exit(-1)
})
//#endregion

//#endregion

// ***** Start bot *****
bot.start(process.env.TOKEN)