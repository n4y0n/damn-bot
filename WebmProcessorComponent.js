const Processor = require("./interfaces/Processor")
const { Message, Client, TextChannel } = require("discord.js")
const path = require("path")
const fs = require("fs")
const axios = require("axios").default
const logger = require("./utils/logging")


module.exports = class WebmProcessorComponent extends Processor {
    /**
     * 
     * @param {Message} message 
     */
    async process(message) {
        console.log("Process webm")
        console.log(message.content)
    }

    /**
     * 
     * @param {Client} bot 
     */
    install(bot) {
        super.install(bot)
        bot.on("ready", () => {
            bot.channels
                .filter(c => c.type == "text")
                .forEach(fetchWebm)
        })
    }

    toString() {
        return `WebmProcessorComponent(${this.getShortID()})`
    }
}

/**
 * @param {TextChannel} channel 
 */
async function fetchWebm(channel) {
    let messages = (await channel.fetchMessages({ limit: 20 })).filter(message => message.attachments.array().length > 0)
    for (let [id, message] of messages) {
        let attachments = message.attachments.array()
        if (attachments.length !== 1) return


        const attachment = attachments.pop()
        const ext = /\.([a-zA-Z]+)$/g.exec(attachment.filename)[1]

        if (ext !== "webm") return

        try {
            let res = await axios({
                method: 'get',
                url: attachment.url,
                responseType: 'stream'
            })
    
            
            console.log(message.id.substr(0, 5), attachment.filename)
        } catch(e) {
            logger.error(e, {location: "WebmProcessorComponent(?????)"})
        }
    }
}