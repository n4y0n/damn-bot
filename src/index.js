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
new MyBot({
    disabledEvents: ['TYPING_START'],
    messageCacheMaxSize: 25,
    messageCacheLifetime: 120,
    messageSweepInterval: 120
}).on('error', err => {
    logger.error(err.message, { location: 'Index' })
    process.exit(-1)
}).registerOnReady(MainBus)
    .start(process.env.TOKEN)


let dispatcher = DispatcherModuleBuilder
    .commandsPrefix('-')
    .withCommandBus()
    .withMessagesBus()
    .build()
    .register(MainBus)


CommandProcessorModule
    .MakeProcessor('-')
    .register(dispatcher.getCommandBus())
    .autoload(__dirname + '/commands')

CiaoBoccModule
    .MakeCiaoBocc()
    .register(dispatcher.getMessagesBus())

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
