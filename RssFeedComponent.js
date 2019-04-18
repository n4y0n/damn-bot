const Watcher = require("rss-watcher")
const Component = require("./interfaces/Component")
const moment = require("moment")
const logger = require("./utils/logging")


module.exports = class RssFeedComponent extends Component {
    constructor(feedurl) {
        super()
        this._watcher = new Watcher(feedurl)
        this._channelsToUpdate = []

        this._watcher.on('new article', async article => {
            console.log(article)
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

    _formatAricle(article) {
        console.log(JSON.stringify(article, null, 2))
        return `[${moment(article.date).format("dd/MM/YYYY HH:mm:ss")}] New episode of: ${article.title}`
    }

    async sendArticle(article) {
        if (!this.isInstalled()) return logger.warn("❌ Component not installed (data loss)")
        for (const channel of this.getChannelsList())
            await this.bot.getChannel(channel).send(this._formatAricle(article))
    }

    async _cleanUp() {
        return this._watcher.close()
    }

    toString() {
        return `RssFeedComponent(${this.getShortID()})`
    }
}