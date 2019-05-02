require("dotenv").config()

const isDocker = require("is-docker")
const readline = require("readline")
const start = Date.now()
const logger = require("./utils/logging")
const { RichEmbed } = require("discord.js")


//const delay = parseInt(process.env.DELAY) || 1
//const message = process.env.MESSAGE
const MyBot = require("./DBot")

const Command = require("./Command")
const CommandProcessor = require("./CommandProcessor")

const RssFeedComponent = require("./RssFeedComponent")
const CommandProcessorComponent = require("./CommandProcessorComponet")
const WebmProcessorComponent = require("./WebmProcessorComponent")


let bot = new MyBot({
    disabledEvents: ["TYPING_START"],
    messageCacheMaxSize: 25,
    messageCacheLifetime: 120,
    messageSweepInterval: 120
})

const rssfeed = new RssFeedComponent('https://nyaa.si/?f=0&c=1_2&q=&page=rss', "NyaaAnime {English-Translated}").addChannel("538747728763682817")
bot.addComponent(rssfeed)

bot.addComponent(new WebmProcessorComponent())

const commander = new CommandProcessor("-", {
    hooks: {
        async onFinishExecution(ok, command) {
            const channel = this.message.channel
            if (!ok) await channel.send(`Error excecuting "${command}"`)
        }
    }
})

const CPC = new CommandProcessorComponent(commander)

bot.addComponent(CPC)

CPC.addCommand(new Command("clean", "cln", {
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

CPC.addCommand(new Command("help", "h", {
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

let cliCommander
if (!isDocker()) {
    cliCommander = new CommandProcessor("!", {
        hooks: {
            async onFinishExecution(found) {
                logger.info("Command found?: " + found ? "Yes" : "No", { location: cliCommander.toString() + " onFinishExecution()" })
            }
        }
    })

    cliCommander.addCommand(new Command("testfeed", "tf", {
        listener: async function () {
            await rssfeed.test()
        }
    }))

    cliCommander.addCommand(new Command("clean", "cln", {
        listener: async function ([num = 1]) {
            const channel = this.message.channel

            const ms = await channel.fetchMessages({ limit: num })

            if (ms.size === 1) return await ms.first().delete()

            if (ms.size < 1) return

            await channel.bulkDelete(ms, true)
        }
    }))

    cliCommander.addCommand(new Command("say", "s", {
        listener: async function (message = []) {
            const channel = this.message.channel
            await channel.send(message.join(" "))
        }
    }))
}

bot.on("ready", () => {
    logger.info("Bot took: " + (Date.now() - start) + "ms", { location: "Main" })
    if (!isDocker()) {
        readline.createInterface({
            input: process.stdin,
            output: process.stdout
        }).on("line", async line => {
            await cliCommander.process({ content: line, channel: bot.channels.get("538747728763682817") })
        })
    }
})

bot.on("error", err => {
    logger.error(err.message, { location: "Main" })
    process.exit(-1)
})

bot.login(process.env.TOKEN).then(token => logger.info("Ok", { location: "Main" }), err => {
    logger.error(err.message, { location: "Main" })
    process.exit(-1)
})