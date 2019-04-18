const Watcher = require("rss-watcher")
const Component = require("./interfaces/Component")
const logger = require("./utils/logging")


module.exports = class RssFeedComponent extends Component {
    constructor(feedurl) {
        super()
        this._watcher = new Watcher(feedurl)

        this._watcher.on('new article', async article => {
            console.log(article)
            await this.sendArticle(article)
        })

        this._watcher.run((err, articles) => { 
            if (err) return logger.error(e)
        })
    }

    _formatAricle(article) {
        return "new element on nyaa"
    }

    async sendArticle(article) {
        if (!this.isInstalled()) return logger.warn("❌ Component not installed (data loss)")
        await this.bot.getChannel("538747728763682817").send(this._formatAricle(article))
    }

    async _cleanUp() {
        return this._watcher.close()
    }

    toString() {
        return `RssFeedComponent(${this.getShortID()})`
    }
}