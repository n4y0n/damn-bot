require("dotenv").config()

const logger = require("./utils/logging")
const path = require("path")
const { initCLI } = require("./utils/termial-cli")
const { RichEmbed } = require("discord.js")

const MyBot = require("./DBot")

const Command = require("./commands/Command")
const CommandProcessor = require("./commands/CommandProcessor")

const RssWatcherAdapter = require("./lib/RssWatcherAdapter")
const RssFeedComponent = require("./components/components/RssFeedComponent")
const CommandProcessorComponent = require("./components/processors/CommandProcessorComponet")
const WebmProcessorComponent = require("./components/processors/WebmProcessorComponent")


const start = Date.now()
let bot = new MyBot({
    disabledEvents: ["TYPING_START"],
    messageCacheMaxSize: 25,
    messageCacheLifetime: 120,
    messageSweepInterval: 120
})

const rsswatcher = new RssWatcherAdapter('https://nyaa.si/?f=0&c=1_2&q=&page=rss')
const rssfeed = new RssFeedComponent(rsswatcher, "NyaaAnime {English-Translated}").addChannel("538747728763682817")
bot.addComponent(rssfeed)

bot.addComponent(new WebmProcessorComponent(path.join(__dirname, "..", "tmp")))

const commander = new CommandProcessor("-", {
    hooks: {
        async onFinishExecution(ok, command) {
            const channel = this.message.channel
            if (!ok) await channel.send(`Error excecuting "${command}"`)
        }
    }
})

const CPC = new CommandProcessorComponent(commander).addListenChannel("538747728763682817")

bot.addComponent(CPC)

CPC.addCommand(new Command("clean", {
    alias: "cln",
    listener: async function ([num = 1]) {
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
    listener: async function () {
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


bot.on("ready", () => {
    logger.info("Bot took: " + (Date.now() - start) + "ms", { location: "Main" })
    initCLI(bot, "538747728763682817")
})

bot.on("error", err => {
    logger.error(err.message, { location: "Main" })
    process.exit(-1)
})

bot.login(process.env.TOKEN).then(token => logger.info("Ok", { location: "Main" }), err => {
    logger.error(err.message, { location: "Main" })
    process.exit(-1)
})
