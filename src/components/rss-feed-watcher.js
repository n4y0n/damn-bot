//@ts-check
const Component = require("../interfaces/Component")
const moment = require("moment")
const { RichEmbed } = require("discord.js")
const logger = require("../utils/logging")
const RssAdapter = require("../interfaces/RssAdapter")


module.exports = class RssFeedComponent extends Component {
    /**
     *
     * @param { RssAdapter } rssAdapter
     * @param { string } feedname
     */
    constructor (rssAdapter, feedname = "") {
        super()

        this.subscribedChannels = []
        this._feedName = feedname

        this.coolDownTime = Date.now() + 3000

        this._watcher = rssAdapter

        this._setupWatcher()

        setTimeout(() => logger.info("Ready", { location: this }), this.coolDownTime - Date.now())
    }

    addChannel (channel) {
        if (this.bot && !this.bot.channels.exists("id", channel))
            return this;
        this.Channels.push(channel)
        return this
    }

    getChannelsList () {
        return this.subscribedChannels
    }

    getFeedName () {
        if (!this._feedName) return this.getShortID()
        return this._feedName
    }

    getRssUrl () {
        return this._watcher.url
    }

    get Channels () {
        return this.getChannelsList()
    }

    _setupWatcher () {
        this._watcher.onArticle(async item => {
            if (!this.bot || !this.botReady() || Date.now() < this.coolDownTime) return
            await this.broadcastArticle(item)
        })

        this._watcher.onError(err => {
            logger.error(err, { location: this })
        })

        this._watcher.run(err => {
            if (!!err) return logger.error(err, { location: this })
            logger.debug("Watcher backend ready", { location: this })
        })
    }

    _formatAricle (article) {
        const embed = new RichEmbed()
        embed.setTitle(`[ NEW ${this.getFeedName()}]`)
        embed.setColor("#4DD0D9")
        embed.addField("Date", moment(article.date).format("DD/MM/YYYY HH:mm:ss"))
        embed.addField("Title", article.title)
        embed.addField("Article", article.guid)
        embed.addField("Download", article.link)
        return embed
    }

    async broadcastArticle (article) {
        if (!this.bot) return
        if (this.getChannelsList() <= 0 || !this.botReady())
            return logger.silly("Bot not ready and/or no channels in channel list", { location: this })

        for (const channel of this.getChannelsList()) {
            await this.sendTo(channel, article)
        }
    }

    async sendTo (channel, article) {

        if (!this.botReady()) return

        const dchannel = this.bot.getChannel(channel)

        if (!!!dchannel) {
            logger.warn(`❌ No channel ${channel} found.`, { location: this })
            return
        }

        dchannel.send(this._formatAricle(article))
    }

    install (bot) {
        super.install(bot)
        bot.on("ready", () => {
            // TODO: find a better way
            // On bot ready remove invalid channels from subscribers list
            let itemRemovedFlag = false
            for (let i = this.subscribedChannels.length - 1; i >= 0; --i) {
                const id = this.subscribedChannels[i]
                if (!bot.channels.exists("id", id)) {
                    this.subscribedChannels[i] = null
                    itemRemovedFlag = true;
                }
            }
            if (itemRemovedFlag) this.subscribedChannels = this.subscribedChannels.filter(val => val !== null)
        })
    }

    async _cleanUp () {
        this._watcher.destroy()
        this.uninstall()
    }

    toString () {
        return `RssFeedComponent(${this.getFeedName()})`
    }
}
