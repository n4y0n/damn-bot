const Watcher = require("rss-watcher")
const Component = require("./interfaces/Component")
const moment = require("moment")
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
            if (err) return logger.error(e)
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
        return `[${this.getFeedName()}] (${moment(article.date).format("DD/MM/YYYY HH:mm:ss")}) New episode: ${article.title}\nLink: ${article.link}`
    }

    async sendArticle(article) {
        if (!this.isInstalled()) return logger.warn("❌ Component not installed (data loss)", { location: this })
        for (const channel of this.getChannelsList())
            await this.bot.getChannel(channel).send(this._formatAricle(article))
    }

    async _cleanUp() {
        return this._watcher.close()
    }

    toString() {
        return `RssFeedComponent(${this.getFeedName()})`
    }
}