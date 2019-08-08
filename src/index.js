require('dotenv').config()

//#region Imports
const logger = require('./utils/logging')
const { initCli } = require('./utils/termial-cli')
const { RichEmbed } = require('discord.js')

const MyBot = require('./DBot')

const Command = require('./interfaces/Command')
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
const clear = new Command('clear', {
    alias: 'clr',
    description: 'Deletes n messages send by this bot (default: 2)'
})
const help = new Command('help', {
    description: 'Lists all available commands.'
})
const mono = new Command('helpgatari', {
    alias: 'fffuckk',
    description: 'Lists Monogatary watch order'
})
// const feeds = new Command('feeds')

mono.exec = async function (ctx) {
    const channel = ctx[Symbol.for('channel')]
    let rm = new RichEmbed()
    rm.setTitle('[ Hey don\'t panic! ]')
    rm.addField("1)", "Bakemonogatari\n---")
    rm.addField("2)", "Nisemonogatari\n---")
    rm.addField("3)", "Nekomonogatari (kuro)\n---")
    rm.addField("4) Monogatari Series S2", "Nekomonogatari (shiro)\n" +
        "Kabukimonogatari\n" +
        "Otorimonogatari\n" +
        "Onimonogatari\n" +
        "Koimonogatari\n" +
        "---")
    rm.addField("5)", "Hanamonogatari\n---")
    rm.addField("6)", "Tsukimonogatari\n---")
    rm.addField("7)", "Owarimonogatari\n---")
    rm.addField("8)", "Koyomimonogatari\n---")
    rm.addField("9)", "Owarimonogatari S2\n---")
    rm.addField("10)", "Zoku Owarimonogatar\n---")
    await channel.send(rm)
}

clear.exec = async function (ctx) {
    const { args } = ctx
    const [command, num = 2] = args
    const channel = ctx[Symbol.for('channel')]

    const msgs = await channel.fetchMessages({ limit: num, })
    if (msgs.size === 1) return await msgs.first().delete()
    if (msgs.size < 1) return
    await channel.bulkDelete(msgs, true)
}
help.exec = async function (ctx) {
    const channel = ctx[Symbol.for('channel')]
    const commandlist = new RichEmbed()
    commandlist.setTitle('[ Command List ]')
    for (const command of ctx.processor.commands) {
        commandlist.addField(command.toString(), command.getDescription())
    }
    await channel.send(commandlist)
}
// feeds.exec = async function (ctx) {
//     const channel = ctx[Symbol.for('channel')]
//     const feeds = new RichEmbed()
//     feeds.setTitle('[ RssFeed List ]')

//     for (const [feedid, feed] of Object.entries(bot.components.normal)) {
//         if (!(feed instanceof RssFeedComponent)) continue
//         feeds.addField(feed.getFeedName(), feed.getRssUrl())
//     }
//     channel.send(feeds)
// }

CPC.addCommand(clear)
CPC.addCommand(help)
CPC.addCommand(mono)
// CPC.addCommand(feeds)
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
