require("dotenv").config()
const { Client } = require("discord.js")
const axios = require("axios").default
const start = Date.now()

const delay = parseInt(process.env.DELAY) || 1
const message = process.env.MESSAGE

async function genMessage() {
    if (message) return message

    const result = (await axios.get("https://icanhazdadjoke.com/", {
        headers: {
            Accept: "application/json"
        }
    })).data.joke

    return result
}

let bot = new Client({
    disabledEvents: ["TYPING_START"],
    messageCacheMaxSize: 25,
    messageCacheLifetime: 120,
    messageSweepInterval: 120
})

bot.on("ready", () => {
    console.log("Bot took: " + (new Date().getTime() - start) + "MS")
    setInterval(async () => {await bot.channels.get("538747728763682817").send(await genMessage())}, delay * 1000 * 60)
})

bot.on("error", err => {
    console.error(err)
    process.exit(-1)
})

bot.login(process.env.TOKEN).then(token => console.log("Ok"), err => {
    console.error(err)
    process.exit(-1)
})