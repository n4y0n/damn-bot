const Component = require("./interfaces/Component")
const moment = require("moment")
const { RichEmbed } = require("discord.js")
const logger = require("./utils/logging")
const RssFeedEmitter = require('rss-feed-emitter');



module.exports = class RssFeedComponent extends Component {
    constructor(feedurl, feedname = "") {
        super()

        this._channelsToUpdate = []
        this._feedName = feedname

        this._watcher = new RssFeedEmitter()
        this.readyTimestamp = Date.now() + 3000

        this._watcher.add({
            url: feedurl,
            refresh: 500
        })

        this._watcher.on('new-item', async item => {
            if (!this.isInstalled() || !this.bot.readyTimestamp || Date.now() < this.readyTimestamp) return
            await this.sendArticle(item)
        })
    }

    addChannel(channel) {
        this.getChannelsList().push(channel)
        return this
    }

    getChannelsList() {
        return this._channelsToUpdate
    }

    getFeedName() {
        if (this._feedName == null || this._feedName === "") return this.getShortID()
        return this._feedName
    }

    _formatAricle(article) {
        const embed = new RichEmbed()
        embed.setTitle(`[ NEW ${this.getFeedName()}]`)
        embed.setColor("#4DD0D9")
        embed.addField("Date", moment(article.date).format("DD/MM/YYYY HH:mm:ss"))
        embed.addField("Title", article.title)
        embed.addField("Link", article.link)
        return embed
    }

    async sendArticle(article) {
        if (!this.isInstalled()) 
            return logger.warn("❌ Component not installed (🚽 data loss 🚽)", { location: this })
        if (this.getChannelsList() <= 0 || !this.bot.readyTimestamp) 
            return logger.silly("Bot not ready and/or no channels in channel list", { location: this })

        for (const channel of this.getChannelsList()) {
            const dchannel = this.bot.getChannel(channel)
            if (!!dchannel)
                dchannel.send(this._formatAricle(article))
            else
                logger.warn(`❌ No channel ${channel} found.`, { location: this })
        }
    }

    async _cleanUp() {
        this._watcher.destroy()
        this.uninstall()
    }

    async test() {
        await this.sendArticle({
            date: Date.now(),
            title: "Test",
            link: "https://example.com"
        })
    }

    toString() {
        return `RssFeedComponent(${this.getFeedName()})`
    }
}