//@ts-check
const isDocker = require("is-docker")
const readline = require("readline")
const EnhancedClient = require("../interfaces/EnhancedClient")
const CommandProcessor = require("../commands/CommandProcessor")
const Command = require("../interfaces/Command")

const logger = require("./logging")


// TODO: use same interface for sending text to : screen - discord chat

/**
 * Initializes terminal cli interface if not in a docker container
 * @param { EnhancedClient } bot
 * @param { string } channel
 */
function initCli (bot, channel) {
    if (isDocker()) return

    let chan = channel

    let cliCommander = new CommandProcessor("!")

    const h = new Command("help")
    const clr = new Command("clr", {
        alias: "c"
    })
    const say = new Command("say", {
        alias: "s"
    })
    const cc = new Command("changeChannel", {
        alias: "cc",
        description: "Cambia il canale dove il bot invia i messaggi del commando 'say'"
    })

    h.exec = async function (ctx) {
        const channel = ctx['chn']
        let commandlist = ' [ Command List ]\n'
        for (const command of ctx.proc.commands) {
            commandlist += "  " + command.toString() + "\n"
            commandlist += "     " + command.getDescription() + "\n\n"
        }
        await channel.send(commandlist)
    }

    cc.exec = async function (ctx) {
        if (!(new RegExp("^\d{18}$", "ig").test(ctx.args[0]))) {
            return logger.warn("Cannot set channel to " + ctx.args[0], { location: "CLI" })
        }
        chan = ctx.args[0]
    }

    clr.exec = async function (ctx) {
        const channel = ctx['channel']
        const { args } = ctx
        const [command, num = 2] = args

        const ms = await channel.fetchMessages({ limit: num })
        if (ms.size === 1) return await ms.first().delete()
        if (ms.size < 1) return
        await channel.bulkDelete(ms, true)
    }

    say.exec = async function (ctx) {
        const channel = ctx['channel']
        ctx.args.shift()
        await channel.send(ctx.args.join(" "))
    }

    cliCommander.addCommand(clr)
    cliCommander.addCommand(say)
    cliCommander.addCommand(cc)
    cliCommander.addCommand(h)

    readline.createInterface({
        input: process.stdin,
        output: process.stdout
    }).on("line", async line => {
        await cliCommander.process({ content: line }, { args: [...line.split(" ")], proc: cliCommander, channel: bot.channels.get(chan), chn: { send: console.log } })
    })
}

module.exports = {
    initCli
}
