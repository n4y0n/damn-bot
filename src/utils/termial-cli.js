const isDocker = require("is-docker")
const readline = require("readline")
const EnhancedClient = require("../interfaces/EnhancedClient")
const CommandProcessor = require("../commands/CommandProcessor")
const Command = require("../interfaces/Command")

// TODO: use same interface for sending test to : screen - discord chat

/**
 * Initializes terminal cli interface if not in a docker container
 * @param { EnhancedClient } bot
 * @param { string } channel
 */
function initCli(bot, channel) {
    if (isDocker()) return

    let cliCommander = new CommandProcessor("!")

    const clr = new Command("clr", {
        alias: "c"
    })
    const say = new Command("say", {
        alias: "s"
    })

    clr.exec = async function (ctx) {
        const { args } = ctx
        const [command, num = 2] = args

        const ms = await ctx.fetchMessages({ limit: num })
        if (ms.size === 1) return await ms.first().delete()
        if (ms.size < 1) return
        await ctx.bulkDelete(ms, true)
    }
    say.exec = async function (ctx) {
        ctx.args.shift()
        await ctx.send(ctx.args.join(" "))
    }

    cliCommander.addCommand(clr)
    cliCommander.addCommand(say)


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
