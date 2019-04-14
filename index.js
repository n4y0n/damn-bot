require("dotenv").config()
const { Client } = require("discord.js")
const readline = require("readline")
const axios = require("axios").default
const validate = require("./validatejs/validate")
const start = Date.now()

// const delay = parseInt(process.env.DELAY) || 1
// const message = process.env.MESSAGE


let bot = new Client({
    disabledEvents: ["TYPING_START"],
    messageCacheMaxSize: 25,
    messageCacheLifetime: 120,
    messageSweepInterval: 120
})

class Command {
    constructor(fullcommand, alias = "", args_schema = null) {
        this.fullcommand = fullcommand
        this.alias = alias
        this.args_schema = args_schema
    }
    async exec(executer = async (args = []) => { }, args = [], onerrorexecuter = null) {
        if (this.checkSchema(args)) {
            await executer(...args)
        } else {
            console.error(`Arguments not respect the schema declared for command [${this.fullcommand}|${this.alias}]`)
            if (onerrorexecuter && onerrorexecuter instanceof Function) {
                await onerrorexecuter(err)
            }
        }
    }

    checkSchema(args = []) {
        if (!this.args_schema) return true
        //return validate(args)
    }

    match(strcommand) {
        return strcommand === this.fullcommand || strcommand === this.alias
    }
}

class Commander {
    constructor() {
        this.commands = []
    }

    addCommand(command, listener, errorlistener = null) {
        this.commands.push({ command, listener, errorlistener })
    }

    async process(content, channel) {
        const args = content.split(" ")
        const cmd = args.shift()

        for (const com of this.commands) {
            if (com.command.match(cmd)) {
                try {
                    if (com.errorlistener) await com.command.exec(com.listener.bind(channel), args, com.errorlistener.bind(this))
                    else await com.command.exec(com.listener.bind(channel), args)
                } catch(e) {
                    console.error(e)
                } finally {
                    break
                }
            }
        }
    }
}

const commander = new Commander()
commander.addCommand(new Command("image", "img"), async function(url, message = "") {
    await this.send(message, { files: [url] })
})
commander.addCommand(new Command("clean", "cln"), async function (num = 1) {
    await this.fetchMessages({ limit: num })
        .then(async msgs => {
            let ms = msgs.filter(m => m.author.id === bot.user.id)
            if (ms.size === 1) return await ms.first().delete()
            if (ms.size < 1) return
            await this.bulkDelete(ms, true)
        });
})
commander.addCommand(new Command("exit", "q"), async function() {
    try {
        await this.send(`Shutting down... Bye 👋`)
        await bot.destroy()
    } finally {
        process.exit(0)
    }
})

async function genMessage() {
    if (message) return message

    const result = (await axios.get("https://icanhazdadjoke.com/", {
        headers: {
            Accept: "application/json"
        }
    })).data.joke

    return result
}


bot.on("ready", async () => {
    console.log("Bot took: " + (Date.now() - start) + "ms")
    // setInterval(async () => {await bot.channels.get("538747728763682817").send(await genMessage())}, delay * 1000 * 60)
    // for(let channel of bot.channels.array()) {
    //     console.log(`${channel.id} - ${channel.type} - ${channel.name}`)
    // }

    // const fare_robe = bot.channels.get("224616803618390029")
    // await fare_robe.join()

    readline.createInterface({
        input: process.stdin,
        output: process.stdout
    }).on("line", async line => {
        if (line.split(" ")[0].toUpperCase().startsWith("!")) {
            await commander.process(line.substr(1), bot.channels.get("538747728763682817"))
        } else {
            await bot.channels.get("538747728763682817").send(line)
        }
    })
})

bot.on("error", err => {
    console.error(err)
    process.exit(-1)
})

bot.login(process.env.TOKEN).then(token => console.log("Ok"), err => {
    console.error(err)
    process.exit(-1)
})