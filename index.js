require("dotenv").config()

const isDocker = require("is-docker")
const readline = require("readline")
const start = Date.now()
const logger = require("./utils/logging")


//const delay = parseInt(process.env.DELAY) || 1
//const message = process.env.MESSAGE
const MyBot = require("./DBot")

const Command = require("./Command")
const CommandProcessor = require("./CommandProcessor")

const RssFeedComponent = require("./RssFeedComponent")
const CommandProcessorComponent = require("./CommandProcessorComponet")

let bot = new MyBot({
    disabledEvents: ["TYPING_START"],
    messageCacheMaxSize: 25,
    messageCacheLifetime: 120,
    messageSweepInterval: 120
})

const rssfeed = new RssFeedComponent('https://nyaa.si/?f=0&c=1_2&q=&page=rss', "NyaaAnime {English-Translated}").addChannel("538747728763682817")
bot.addComponent(rssfeed)

const commander = new CommandProcessor("-", {
    hooks: {
        async onFinishExecution(ok, command) {
            if (!ok) await this.channel.send(`Error excecuting "${command}"`)
        }
    }
})

const CPC = new CommandProcessorComponent(commander)

bot.addComponent(CPC)

CPC.addCommand(new Command("image", "img", {
    listener: async function ([board = "a", thread = null]) {
        let m = await this.channel.send("WIP")
        setTimeout(() => m.delete(), 5000)
    }
}))

CPC.addCommand(new Command("clean", "cln", {
    listener: async function ([num = 1]) {
        const msgs = await this.channel.fetchMessages({ limit: num })

        let ms = msgs.filter(m => (m.author.id === bot.user.id) && m.deletable)

        if (ms.size === 1) return await ms.first().delete()

        if (ms.size < 1) return

        await this.channel.bulkDelete(ms, true)
    }
}))

CPC.addCommand(new Command("say", "s", {
    listener: async function (message = []) {
        await this.channel.send(message.join(" "))
    }
}))

let cliCommander
if (!isDocker()) {
    cliCommander = new CommandProcessor("!", {
        hooks: {
            async onFinishExecution(found) {
                logger.info("Command found?: " + found ? "Yes" : "No", { location: cliCommander.toString()+" onFinishExecution()" })
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
            const ms = await this.channel.fetchMessages({ limit: num })

            if (ms.size === 1) return await ms.first().delete()

            if (ms.size < 1) return

            await this.channel.bulkDelete(ms, true)
        }
    }))

    cliCommander.addCommand(new Command("say", "s", {
        listener: async function (message = []) {
            await this.channel.send(message.join(" "))
        }
    }))
}

bot.on("ready", () => {
    logger.info("Bot took: " + (Date.now() - start) + "ms", { location: "Main" })
    // setInterval(async () => {await bot.channels.get("538747728763682817").send(await genMessage())}, delay * 1000 * 60)
    // for(let channel of bot.channels.array()) {
    //     logger.info(`${channel.id} - ${channel.type} - ${channel.name}`, { location: "Main" })
    // }

    // const fare_robe = bot.channels.get("224616803618390029")
    // await fare_robe.join()
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