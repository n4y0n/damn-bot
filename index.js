require("dotenv").config()
const { Client } = require("discord.js")
const axios = require("axios").default
const start = Date.now()

//const delay = parseInt(process.env.DELAY) || 1
//const message = process.env.MESSAGE

const Commander = require("./Commander")
const Command = require("./Command")

async function genMessage() {
    if (message) return message

    const result = (await axios.get("https://icanhazdadjoke.com/", {
        headers: {
            Accept: "application/json"
        }
    })).data.joke

    return result
}

const commander = new Commander("-")
commander.addCommand(new Command("image", "img"), async function ([board = "a", thread = null]) {
    let m = await this.channel.send("WIP")
    setTimeout(() => m.delete(), 5000)
})
commander.addCommand(new Command("clean", "cln"), async function ([num = 1]) {    
    const msgs = await this.channel.fetchMessages({ limit: num })

    let ms = msgs.filter(m => m.author.id === bot.user.id)
    
    if (ms.size === 1) return await ms.first().delete()
    
    if (ms.size < 1) return
    
    await this.channel.bulkDelete(ms, true)
})
commander.addCommand(new Command("say", "s"), async function (message = []) {
    await this.channel.send(message.join(" "))
})

let bot = new Client({
    disabledEvents: ["TYPING_START"],
    messageCacheMaxSize: 25,
    messageCacheLifetime: 120,
    messageSweepInterval: 120
})

bot.on("message", async message => {
    if (message.author.id == bot.user.id || !(message.channel.id == "538747728763682817")) return
    await commander.process(message)
    await message.delete()
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