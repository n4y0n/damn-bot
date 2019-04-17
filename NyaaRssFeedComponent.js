const Watcher = require("rss-watcher")
const Component = require("./Component")

module.exports = class NyaaRssFeedComponent extends Component {
    constructor() {
        super()
        let feed = 'https://nyaa.si/?page=rss'
        this._watcher = new Watcher(feed)

        this._watcher.on('new article', (article) => {
            console.log(article)
            this.sendArticle(article)
        })

        this._watcher.run((err, articles) => { 
            if (err) return console.error(err)
        })
    }

    _formatAricle(article) {
        return "new element on nyaa | " + article
    }

    sendArticle(article) {
        if (!this.isInstalled()) return console.error("Component not installed (Possible data loss)")
        this.bot.getChannel("538747728763682817").send(article)
    }

    async _cleanUp() {
        return this._watcher.close()
    }
}