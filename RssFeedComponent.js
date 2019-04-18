const Watcher = require("rss-watcher")
const Component = require("./interfaces/Component")
const moment = require("moment")
const { RichEmbed } = require("discord.js")
const logger = require("./utils/logging")


module.exports = class RssFeedComponent extends Component {
    constructor(feedurl, feedname = "") {
        super()
        this._watcher = new Watcher(feedurl)
        this._channelsToUpdate = []
        this._feedName = feedname

        this._watcher.on('new article', async article => {
            await this.sendArticle(article)
        })

        this._watcher.run((err, articles) => {
            if (err) return logger.error(err, { location: this })
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
        if (!this.isInstalled()) return logger.warn("❌ Component not installed (data loss)", { location: this })
        for (const channel of this.getChannelsList())
            await this.bot.getChannel(channel).send(this._formatAricle(article))
    }

    async _cleanUp() {
        return this._watcher.close()
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