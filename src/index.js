require("dotenv").config()

// Imports
const logger = require("./utils/logging")
const path = require("path")
const { initCli } = require("./utils/termial-cli")
const { RichEmbed } = require("discord.js")

const MyBot = require("./DBot")

const Command = require("./commands/Command")
const CommandProcessor = require("./commands/CommandProcessor")

const RssWatcherAdapter = require("./lib/RssWatcherAdapter")

const RssFeedComponent = require("./components/RssFeedComponent")
const CommandProcessorComponent = require("./components/processors/CommandProcessorComponet")

// ***** Variables *****
const rss = {
    "NyaaAnime {English-Translated}": "https://nyaa.si/?f=0&c=1_2&q=&page=rss"
}

const botChannel = "538747728763682817"


// ***** Setup *****
const start = Date.now()
let bot = new MyBot({
    disabledEvents: ["TYPING_START"],
    messageCacheMaxSize: 25,
    messageCacheLifetime: 120,
    messageSweepInterval: 120
})

const commander = new CommandProcessor("-")
const CPC = new CommandProcessorComponent(commander).addListenChannel(botChannel)
bot.addComponent(CPC)

for (let [name, url] of Object.entries(rss)) {
    const rsswatcher = new RssWatcherAdapter(url)
    const rssfeed = new RssFeedComponent(rsswatcher, name).addChannel(botChannel)
    bot.addComponent(rssfeed)
}

// ***** Setup commands *****
CPC.addCommand(new Command("clean", {
    alias: "cln",
    async listener([num = 1]) {
        const channel = this.message.channel

        const msgs = await channel.fetchMessages({ limit: num })

        let ms = msgs.filter(m => m.author.id === bot.user.id)

        if (ms.size === 1) return await ms.first().delete()

        if (ms.size < 1) return

        await channel.bulkDelete(ms, true)
    },
    description: "Deletes n messages send by this bot (default: 1)"
}))

CPC.addCommand(new Command("help", {
    alias: "h",
    async listener() {
        const channel = this.message.channel
        const processor = this.proc

        const commandlist = new RichEmbed()
        commandlist.setTitle("[ Command List ]")

        for (const command of processor.commands) {
            commandlist.addField(command.toString(), command.getDescription())
        }

        channel.send(commandlist)
    },
    description: "Lists all available commands."
}))

CPC.addCommand(new Command("feeds", {
    async listener() {
        const channel = this.message.channel

        const feeds = new RichEmbed()
        feeds.setTitle("[ RssFeed List ]")

        for(const [name, feed] of Object.entries(bot.components.normal)) {
            if (!(feed instanceof RssFeedComponent)) continue
            feeds.addField(feed.toString(), feed._watcher.url)

        }
        channel.send(feeds)
    }
}))

// ***** Bot hooks *****
bot.on("ready", () => {
    logger.info("Bot took: " + (Date.now() - start) + "ms", { location: "Main" })
    initCli(bot, botChannel)
})

bot.on("error", err => {
    logger.error(err.message, { location: "Main" })
    process.exit(-1)
})

// ***** Start bot *****
bot.login(process.env.TOKEN)
    .then(token => logger.info("Ok", { location: "Main" }))
    .catch(err => {
        logger.error(err.message, { location: "Main" })
        process.exit(-1)
    })
