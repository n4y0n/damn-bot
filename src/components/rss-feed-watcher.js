//@ts-check
const Layer = require("../interfaces/Layer")
const moment = require("moment")
const { RichEmbed } = require("discord.js")
const log = require("../utils/logging").getLogger("RSSWatcher")
const RssAdapter = require("../interfaces/RssAdapter")


class RssFeedReader extends Layer {
    /**
     *
     * @param { RssAdapter } rssAdapter
     * @param { string } feedname
     */
    constructor (rssAdapter, feedname = "", channel) {
        super()
        this.name = feedname
        this.channel = channel
        this.coolDownTime = Date.now() + 3000
        this._watcher = rssAdapter
        this._setupWatcher()
        setTimeout(() => log.i("Ready"), this.coolDownTime - Date.now())
    }

    _setupWatcher () {
        this._watcher.onArticle(async item => {
            if (Date.now() < this.coolDownTime) return
            await this.sendArticle(item)
        })

        this._watcher.onError(err => {
            log.e(err)
        })

        this._watcher.run(err => {
            if (!!err) return log.error(err)
            log.d("Watcher backend ready")
        })
    }

    _formatAricle (article) {
        const embed = new RichEmbed()
        embed.setTitle(`[ NEW ${this.name}]`)
        embed.setColor("#4DD0D9")
        embed.addField("Date", moment(article.date).format("DD/MM/YYYY HH:mm:ss"))
        embed.addField("Title", article.title)
        embed.addField("Article", article.guid)
        embed.addField("Download", article.link)
        return embed
    }

    async sendArticle (article) {
        await this.channel.send(this._formatAricle(article))
    }

    stop () {
        this._watcher.destroy()
    }

    toString () {
        return `RssFeedReader(name="${this.name}")`
    }
}

module.exports = (adapter, feedname, channel) => new RssFeedReader(adapter, feedname, channel)
