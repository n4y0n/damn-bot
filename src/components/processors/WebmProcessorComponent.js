const Processor = require("../../interfaces/Processor")
const { Message, Client, TextChannel } = require("discord.js")
const path = require("path")
const fs = require("fs")
const axios = require("axios").default
const logger = require("../../utils/logging")
const ffmpeg = require("ffmpeg")


module.exports = class WebmProcessorComponent extends Processor {

    constructor(tmpFolder = "./") {
        super()
        this.tmp = tmpFolder
    }

    /**
     * @param {Message} message 
     */
    async process(message) {
        await this.convertWebmAttachmentToMp4(message)
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
                .forEach(this.fetchWebm.bind(this))
        })
    }

    /**
     * @param {TextChannel} channel 
     */
    async fetchWebm(channel) {
        let messages = (await channel.fetchMessages({ limit: 20 })).filter(message => message.attachments.array().length > 0)
        for (let [id, message] of messages) {
            try {
                await this.convertWebmAttachmentToMp4(message)
            } catch (e) {
                logger.warn(e, { location: this })
            }
        }
    }

    /**
     * 
     * @param {Message} message 
     */
    async convertWebmAttachmentToMp4(message) {
        let attachments = message.attachments.array()
        if (attachments.length > 1 || attachments.length <= 0) return

        const attachment = attachments.pop()

        if (this.isNotA(attachment.filename, "webm"))
            return logger.silly(`${attachment.filename} is not a valid webm`, { location: this })

        const webmfilepath = path.join(this.tmp, attachment.filename)
        const output = path.join(this.tmp, `${attachment.filename.substring(0, attachment.filename.length - 5)}.mp4`)
        
        try {

            await this.downloadFile(attachment.url, webmfilepath)
            logger.debug(`Downloaded ${attachment.filename}`, { location: this })
            logger.debug(`Converting to mp4...`, { location: this })
            await this.convertToMp4(webmfilepath, output)

            const stats = fs.statSync(output)

            if (stats.size > 8388606) {
                logger.debug(`File too large after conversion (${stats.size}bytes)`, { location: this })
                return
            }

            await message.channel.send(`${message.author.username}'s -> ${attachment.filename}`, { file: output })
            await message.delete()

        } catch (e) {

            logger.error(e, { location: this })

        } finally {

            fs.unlinkSync(webmfilepath)
            fs.unlinkSync(output)

        }
    }

    isNotA(filename, format) {
        const ext = /\.([0-9a-z]+)$/i.exec(filename)
        return ext[1] !== format
    }
    downloadFile(url, dest) {
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

    convertToMp4(inFilePath, outFilePath) {
        return new Promise((resolve, reject) => {
            new ffmpeg(inFilePath).then(video => {
                video.setVideoFormat("mp4").setVideoSize('640x480', true, false).save(outFilePath, function (err) {
                    if (err) return reject(err)
                    resolve()
                })
            })
        })
    }

    toString() {
        return `WebmProcessorComponent(${this.getShortID()})`
    }
}