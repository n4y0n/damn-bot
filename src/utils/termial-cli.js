const isDocker = require("is-docker")
const readline = require("readline")
const EnhancedClient = require("../interfaces/EnhancedClient")
const CommandProcessor = require("../commands/CommandProcessor")
const Command = require("../commands/Command")


/**
 * Initializes terminal cli interface if not in a docker container
 * @param { EnhancedClient } bot
 * @param { string } channel
 */
function initCli(bot, channel) {
    if (isDocker()) return

    let cliCommander = new CommandProcessor("!", {
        hooks: {
            async onFinishExecution(found) {
                logger.info("Command found?: " + found ? "Yes" : "No", { location: cliCommander.toString() + " onFinishExecution()" })
            }
        }
    })

    cliCommander.addCommand(new Command("testfeed", {
        alias: "tf",
        listener: async function () {
            await rssfeed.test()
        }
    }))

    cliCommander.addCommand(new Command("clean", {
        alias: "cln",
        listener: async function ([num = 1]) {
            const channel = this.message.channel

            const ms = await channel.fetchMessages({ limit: num })

            if (ms.size === 1) return await ms.first().delete()

            if (ms.size < 1) return

            await channel.bulkDelete(ms, true)
        }
    }))

    cliCommander.addCommand(new Command("say", {
        alias: "s",
        listener: async function (message = []) {
            const channel = this.message.channel
            await channel.send(message.join(" "))
        }
    }))


    readline.createInterface({
        input: process.stdin,
        output: process.stdout
    }).on("line", async line => {
        await cliCommander.process({ content: line, channel: bot.channels.get(channel) })
    })
}

module.exports = {
    initCli
}
