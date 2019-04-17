const Watcher = require("rss-watcher")
const Component = require("./Component")

module.exports = class NyaaRssFeedComponent extends Component {
    constructor() {
        super()
        let feed = 'https://nyaa.si/?page=rss'
        let watcher = new Watcher(feed)

        watcher.on('new article', (article) => {
            this.sendArticle(article)
        })

        watcher.run((err, articles) => { 
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
}