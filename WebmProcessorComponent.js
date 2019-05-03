const Processor = require("./interfaces/Processor")
const { Message, Client, TextChannel } = require("discord.js")
const path = require("path")
const fs = require("fs")
const axios = require("axios").default
const logger = require("./utils/logging")
const ffmpeg = require("ffmpeg")


module.exports = class WebmProcessorComponent extends Processor {
    /**
     * 
     * @param {Message} message 
     */
    async process(message) {
        await convertWebmAttachmentToMp4(message)
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
 * 
 * @param {Message} message 
 */
async function convertWebmAttachmentToMp4(message) {
    let attachments = message.attachments.array()
    if (attachments.length > 1 || attachments.length <= 0) return

    const attachment = attachments.pop()
    const ext = /\.([a-zA-Z]+)$/g.exec(attachment.filename)

    if (!ext || ext[1] !== "webm") return

    try {

        const webmfilepath = path.join(__dirname, "tmp", attachment.filename)
        const output = path.join(__dirname, "tmp", `${attachment.filename.substring(0, attachment.filename.length - 5)}.mp4`)

        await downloadFile(attachment.url, webmfilepath)
        await convertToMp4(webmfilepath, output)
    
        const stats = fs.statSync(output)
        if (stats.size < 8388606) {
            await message.channel.send(`${message.author.username}'s -> ${attachment.filename}`, { file: output })
            await message.delete()
        }

        fs.unlinkSync(webmfilepath)
        fs.unlinkSync(output)
    } catch (e) {
        logger.error(e, { location: "WebmProcessorComponent(?????)" })
    }
} 


/**
 * @param {TextChannel} channel 
 */
async function fetchWebm(channel) {
    let messages = (await channel.fetchMessages({ limit: 20 })).filter(message => message.attachments.array().length > 0)
    for (let [id, message] of messages) {
        await convertWebmAttachmentToMp4(message)
    }
}

function downloadFile(url, dest) {
    const writer = fs.createWriteStream(dest)
    
    return new Promise((resolve, reject) => {
        axios({
            url,
            method: 'GET',
            responseType: 'stream'
        }).then(response => {
            response.data.pipe(writer)
        })
        .catch(reject)

        writer.on('finish', resolve)
        writer.on('error', reject)
    })
}

function convertToMp4(inFilePath, outFilePath) {
    const pp = new ffmpeg(inFilePath)
    return new Promise((resolve, reject) => {
        pp.then(video => {
            video.setVideoFormat("mp4").setVideoSize('640x480', true, false).save(outFilePath, function(err) {
                if (err) return reject(err)
                resolve()
            }) 
        })
    })
}