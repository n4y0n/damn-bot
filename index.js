require("dotenv").config()
const { Client } = require("discord.js")
const readline = require("readline")
const axios = require("axios").default
const start = Date.now()

// const delay = parseInt(process.env.DELAY) || 1
// const message = process.env.MESSAGE

async function genMessage() {
    if (message) return message

    const result = (await axios.get("https://icanhazdadjoke.com/", {
        headers: {
            Accept: "application/json"
        }
    })).data.joke

    return result
}

async function processCommand(string = "nop", channel) {
    const args = string.split(" ")
    if (args.shift() === "image") {
        const url = args.shift()
        if (!url) return console.error("No url provided")
        await channel.send("", { files: [url] })
    }
}

let bot = new Client({
    disabledEvents: ["TYPING_START"],
    messageCacheMaxSize: 25,
    messageCacheLifetime: 120,
    messageSweepInterval: 120
})

bot.on("ready", () => {
    console.log("Bot took: " + (new Date().getTime() - start) + "MS")
    // setInterval(async () => {await bot.channels.get("538747728763682817").send(await genMessage())}, delay * 1000 * 60)

    readline.createInterface({
        input: process.stdin,
        output: process.stdout
    }).on("line", async line => {
        if (line.split(" ")[0].toUpperCase().startsWith("!")) {
            await processCommand(line.substr(1), bot.channels.get("538747728763682817"))
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