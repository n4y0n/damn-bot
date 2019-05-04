const Component = require("../../interfaces/Component")
const moment = require("moment")
const { RichEmbed, Client } = require("discord.js")
const logger = require("../../utils/logging")
const RssWatcher = require('rss-watcher');



module.exports = class RssFeedComponent extends Component {
    constructor(feedurl, feedname = "") {
        super()

        this.subscribedChannels = []
        this._feedName = feedname

        this._watcher = new RssWatcher(feedurl)
        this.coolDownTime = Date.now() + 3000

        this._watcher.on('new article', async item => {
            if (!this.isInstalled() || !this.botReady() || Date.now() < this.coolDownTime) return
            await this.broadcastArticle(item)
        })

        this._watcher.run((err) => {
            if (!!err) return logger.error(err, { location: this })
            logger.debug("Watcher backend ready", { location: this })
        })

        this._watcher.on('error', err => {
            logger.error(err, { location: this })
        })

        setTimeout(() => logger.info("Ready", { location: this }), this.coolDownTime - Date.now())
    }

    addChannel(channel) {
        if (this.installed && !bot.channels.exists("id", id))
            return this;
        this.getChannelsList().push(channel)
        return this
    }

    getChannelsList() {
        return this.subscribedChannels
    }

    getFeedName() {
        if (!this._feedName) return this.getShortID()
        return this._feedName
    }

    _formatAricle(article) {
        const embed = new RichEmbed()
        embed.setTitle(`[ NEW ${this.getFeedName()}]`)
        embed.setColor("#4DD0D9")
        embed.addField("Date", moment(article.date).format("DD/MM/YYYY HH:mm:ss"))
        embed.addField("Title", article.title)
        embed.addField("Article", article.guid)
        embed.addField("Download", article.link)
        return embed
    }

    async broadcastArticle(article) {
        if (!this.isInstalled()) return
        if (this.getChannelsList() <= 0 || !this.botReady())
            return logger.silly("Bot not ready and/or no channels in channel list", { location: this })

        for (const channel of this.getChannelsList()) {
            await this.sendTo(channel, article)
        }
    }

    async sendTo(channel, article) {
        if (!this.botReady()) return
        const dchannel = this.bot.getChannel(channel)
        if (!!dchannel)
            dchannel.send(this._formatAricle(article))
        else
            logger.warn(`❌ No channel ${channel} found.`, { location: this })
    }

    /**
     * 
     * @param {Client} bot 
     */
    install(bot) {
        super.install(bot)
        bot.on("ready", () => {
            // TODO: find a better way
            // On bot ready remove invalid channels from subscribers list
            let itemRemovedFlag = false
            for(let i = this.subscribedChannels.length - 1; i >= 0; --i) {
                const id = this.subscribedChannels[i]
                if (!bot.channels.exists("id", id)) {
                    this.subscribedChannels[i] = null
                    itemRemovedFlag = true;
                }
            }
            if (itemRemovedFlag) this.subscribedChannels = this.subscribedChannels.filter(val => val !== null)
        })
    }

    async _cleanUp() {
        this._watcher.destroy()
        this.uninstall()
    }

    async test() {
        await this.broadcastArticle({
            date: Date.now(),
            title: "Test",
            link: "https://example.com"
        })
    }

    toString() {
        return `RssFeedComponent(${this.getFeedName()})`
    }
}