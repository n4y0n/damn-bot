require("dotenv").config()
const { Client } = require("discord.js")
const readline = require("readline")
const axios = require("axios").default
const validate = require("./validatejs/validate")
const start = Date.now()

//const delay = parseInt(process.env.DELAY) || 1
//const message = process.env.MESSAGE

const Commander = require("./Commander")
const Command = require("./Command")

class MyBot extends Client {
    constructor(commands_prefix = "-", options = {}) {
        super(options)
        this.prefix = commands_prefix

        this.commander = new Commander(commands_prefix)

        this.on("message", async message => {
            if (message.author.id == this.user.id || !(message.channel.id == "538747728763682817")) return
            await commander.process(message)
            await message.delete()
        })
    }
    
    async genMessage() {
        if (message) return message

        const result = (await axios.get("https://icanhazdadjoke.com/", {
            headers: {
                Accept: "application/json"
            }
        })).data.joke

        return result
    }

    addCommand(command, listener, errorlistener = null) {
        this.commander.addCommand(command, listener, errorlistener)
    }
}


let bot = new MyBot("-", {
    disabledEvents: ["TYPING_START"],
    messageCacheMaxSize: 25,
    messageCacheLifetime: 120,
    messageSweepInterval: 120
})


bot.addCommand(new Command("image", "img"), async function ([board = "a", thread = null]) {
    let m = await this.channel.send("WIP")
    setTimeout(() => m.delete(), 5000)
})

bot.addCommand(new Command("clean", "cln"), async function ([num = 1]) {    
    const msgs = await this.channel.fetchMessages({ limit: num })

    let ms = msgs.filter(m => m.author.id === bot.user.id)
    
    if (ms.size === 1) return await ms.first().delete()
    
    if (ms.size < 1) return
    
    await this.channel.bulkDelete(ms, true)
})

bot.addCommand(new Command("say", "s"), async function (message = []) {
    await this.channel.send(message.join(" "))
})


bot.on("ready", () => {
    console.log("Bot took: " + (new Date().getTime() - start) + "MS")
    //setInterval(async () => {await bot.channels.get("538747728763682817").send(await genMessage())}, delay * 1000 * 60)
})

bot.on("error", err => {
    console.error(err)
    process.exit(-1)
})

bot.login(process.env.TOKEN).then(token => console.log("Ok"), err => {
    console.error(err)
    process.exit(-1)
})