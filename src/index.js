//@ts-check
require('dotenv').config()

//#region Imports
const winston = require('winston')
const tlog = require("./utils/telegramNotifier")
const logger = require('./utils/logging')

const { initCli } = require('./utils/termial-cli')

const MyBot = require('./DBot')
const CommandProcessor = require('./commands/CommandProcessor')

const CommandProcessorComponent = require('./components/processors/CommandProcessorComponet')
const CiaoBoccProcessorComponent = require('./components/processors/CiaoBoccProcessorComponent')
//#endregion

//#region ***** Variables *****

const botChannel = '538747728763682817'
//#endregion

//#region ***** Setup *****

logger.add(new winston.transports.Stream({
    level: process.env.NODE_ENV === "production" ? "warn" : "info",
    stream: new tlog.TelegramLoggerStream()
}))

const start = Date.now()
let bot = new MyBot({
    disabledEvents: ['TYPING_START'],
    messageCacheMaxSize: 25,
    messageCacheLifetime: 120,
    messageSweepInterval: 120
})

const commander = new CommandProcessor('-')
const CPC = new CommandProcessorComponent(commander)
const ciaoBocc = new CiaoBoccProcessorComponent()
bot.addComponent(CPC)
bot.addComponent(ciaoBocc)

//#region ***** Setup commands *****
const clear = require('./commands/Clear.command')
const help = require('./commands/Help.command')
const mono = require('./commands/Mono.command')
const mct = require('./commands/Mc.command')
CPC.addCommand(clear)
CPC.addCommand(help)
CPC.addCommand(mono)
CPC.addCommand(mct)
//#endregion

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
