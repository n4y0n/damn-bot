require("dotenv").config()
const { Client } = require("discord.js")
const readline = require("readline")
const axios = require("axios").default
const start = Date.now()

// const delay = parseInt(process.env.DELAY) || 1
// const message = process.env.MESSAGE


let bot = new Client({
    disabledEvents: ["TYPING_START"],
    messageCacheMaxSize: 25,
    messageCacheLifetime: 120,
    messageSweepInterval: 120
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

async function processCommand(string = "nop", channel, voice = null) {
    const args = string.split(" ")
    const cmd = args.shift()
    switch (cmd) {
        case "image": 
        {
            const url = args.shift()
            let message = args.join(" ")

            if (!url) return console.error("No url provided")
            if (!message) message = ""
            
            await channel.send(message, { files: [url] })
        }
        break;
        case "clean":
        {
            let num = args.shift() || "1"
            await channel.fetchMessages({ limit: parseInt(num) })
            .then(async msgs => {
                let ms = msgs.filter(m => m.author.id === bot.user.id)
                if (ms.size === 1) return await ms.first().delete()
                if (ms.size < 1) return
                await channel.bulkDelete(ms, true)
            });
        }
        break;
        // case "say":
        // {
        //     if (!voice) {
        //         console.error("No connection to voice channel")
        //         break;
        //     }
        //     await channel.send(args.join(" "), { tts: true })
        // }
        // break;
    }
}

bot.on("ready", async () => {
    console.log("Bot took: " + (new Date().getTime() - start) + "MS")
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
            await processCommand(line.substr(1), bot.channels.get("538747728763682817"))//, fare_robe)
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