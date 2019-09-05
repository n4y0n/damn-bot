//@ts-check
const { RichEmbed } = require('discord.js')
const Command = require('../interfaces/Command')
const RssFeedComponent = require('../components/RssFeedComponent')

module.exports = new Command('feeds')

// FIXME: Doesn't work

module.exports.exec = async function (ctx) {
    const channel = ctx['chn']
    const bot = ctx['proc'].bot
    const feeds = new RichEmbed()
    feeds.setTitle('[ RssFeed List ]')

    for (const [feedid, feed] of Object.entries(bot.components.normal)) {
        if (!(feed instanceof RssFeedComponent)) continue
        feeds.addField(feed.getFeedName(), feed.getRssUrl())
    }
    await channel.send(feeds)
}
