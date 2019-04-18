const Watcher = require("rss-watcher")
const Component = require("./interfaces/Component")

module.exports = class RssFeedComponent extends Component {
    constructor(feedurl) {
        super()
        this._watcher = new Watcher(feedurl)

        this._watcher.on('new article', async article => {
            console.log(article)
            await this.sendArticle(article)
        })

        this._watcher.run((err, articles) => { 
            if (err) return console.error(err)
        })
    }

    _formatAricle(article) {
        return "new element on nyaa"
    }

    async sendArticle(article) {
        if (!this.isInstalled()) return console.error("❌ Component not installed (data loss)")
        await this.bot.getChannel("538747728763682817").send(this._formatAricle(article))
    }

    async _cleanUp() {
        return this._watcher.close()
    }

    toString() {
        return `RssFeedComponent(${this.getID()})`
    }
}