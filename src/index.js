require('dotenv').config()

//#region Imports
const logger = require('./utils/logging')
const { initCli } = require('./utils/termial-cli')

const MyBot = require('./DBot')
const CommandProcessor = require('./commands/CommandProcessor')

// const RssWatcherAdapter = require('./lib/RssWatcherAdapter')
// const RssFeedComponent = require('./components/RssFeedComponent')

const CommandProcessorComponent = require('./components/processors/CommandProcessorComponet')
const CiaoBoccProcessorComponent = require('./components/processors/CiaoBoccProcessorComponent')
//#endregion

//#region ***** Variables *****
// const rss = {
//     'NyaaAnime {English-Translated}': 'https://nyaa.si/?f=0&c=1_2&q=&page=rss'
// }

const botChannel = '538747728763682817'
//#endregion

//#region ***** Setup *****
const start = Date.now()
let bot = new MyBot({
    disabledEvents: ['TYPING_START'],
    messageCacheMaxSize: 25,
    messageCacheLifetime: 120,
    messageSweepInterval: 120
})

const commander = new CommandProcessor('-')
const CPC = new CommandProcessorComponent(commander).addListenChannel(botChannel)
const ciaoBocc = new CiaoBoccProcessorComponent()
bot.addComponent(CPC)
bot.addComponent(ciaoBocc)

//#region ***** RSSWatcher Setup *****
// for (let [name, url] of Object.entries(rss)) {
//     const rsswatcher = new RssWatcherAdapter(url)
//     const rssfeed = new RssFeedComponent(rsswatcher, name).addChannel(botChannel)
//     bot.addComponent(rssfeed)
// }
//#endregion

//#region ***** Setup commands *****
const clear = require('./commands/Clear.command')
const help = require('./commands/Help.command')
const mono = require('./commands/Mono.command')
CPC.addCommand(clear)
CPC.addCommand(help)
CPC.addCommand(mono)
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
