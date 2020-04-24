//@ts-check
const { RichEmbed } = require('discord.js')
const DiscordCommand = require('../interfaces/discord-command')
const RssWatcher = require("rss-watcher")
const moment = require("moment")
const log = require("../utils/logging").getLogger("Command RssFeed")


class RssFeedReader {
    /**
     *
     * @param { string } feedname
     */
    constructor (feedname = "", url, channel) {
        this.name = feedname
        this.channel = channel
        this.coolDownTime = Date.now() + 3000
        this.url = url;
        this._watcher = new RssWatcher(url)
        this._setupWatcher()
        setTimeout(() => log.i("Ready"), this.coolDownTime - Date.now())
    }

    _setupWatcher () {
        this._watcher.on("new article", async item => {
            if (Date.now() < this.coolDownTime) return
            await this.sendArticle(item)
        })

        this._watcher.on("error", err => {
            log.e(err)
        })

        this._watcher.run((err) => {
            if (err) { return log.e(err) }
            else { log.d("Watcher backend ready") }
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
        return this._watcher.destroy()
    }

    toString () {
        return `RssFeedReader(name="${this.name}")`
    }
}

module.exports = bot => {
    const feeds = new Map();

    const command = new DiscordCommand('feed', {
        description: 'RssFeed Management.'
    });

    function listFeeds(message) {
        const emb = new RichEmbed();
        emb.setTitle('[ RssFeeds Editor ]');
        if (feeds.size === 0) { emb.addField("¯\\_(ツ)_/¯", "No feeds."); return; }
        for (let [key, value] of feeds.entries()) {
            emb.addField(key, value.url);
        }

        return message.channel.send(emb);
    }

    function helpCommands(message) {
        const emb = new RichEmbed();
        emb.setTitle('[ RssFeeds Editor ]');

        emb.addField("help", "This help.");
        emb.addField("list", "Lists registered feeds.");
        emb.addField("add <feedname> <url>", "Adds a feed.");
        emb.addField("load", "Load.");

        return message.channel.send(emb); 
    }

    function addFeed(message, feedName, feedUrl) {
        if (!feedName) { return message.react("🛑"); } 
        if (!feedUrl) { return message.react("🛑"); } 

        const emb = new RichEmbed();
        emb.setTitle('[ RssFeeds Editor ]');
        
        feeds.set(feedName, new RssFeedReader(feedName, feedUrl, message.channel));

        return message.react("✨")
    }

    function loadFeeds(message) {
        
    }

    command.exec = async function (message, command, feedName, feedUrl) {
        await message.react("🎷");

        switch (command) {
            case "list": return listFeeds(message);
            case "help": return helpCommands(message);
            case "add" : return addFeed(message, feedName, feedUrl);
            case "load": return loadFeeds(message);
            default: return helpCommands(message);
        }
    }

    return command;
}
