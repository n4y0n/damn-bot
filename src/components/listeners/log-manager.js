//@ts-check
const Processor = require('../../interfaces/Processor')
const logger = require('../../utils/logging')
const {Message} = require('discord.js')

class MessageLogManager extends Processor {
    constructor (showID = false) {
        super()
        this.showID = showID
    }

    async process (message) {
        const guildname = message.guild.name
        const guildid = message.guild.id

        const channelname = message.channel.name ? message.channel.name : "Private"
        const channelid = message.channel.id ? message.channel.id : "XXXXXXXXXXXXXXXXXX"
        const auid = message.author.id
        
        if (this.showID) {
            logger.verbose(`${guildname}(${guildid})/${channelname}(${channelid}) -> ${message.author.username}(${auid}): ${message.content}`, { location: this })
        } else {
            logger.verbose(`${guildname}/${channelname} -> ${message.author.username}: ${message.content}`, { location: this })
        }
        return false
    }

    toString () {
        return `MessagesLogger#${this.getShortID()}`
    }
}

module.exports = new MessageLogManager()