//@ts-check
const Layer = require('../../interfaces/Layer')
const log = require('../../utils/logging').getLogger("MessageLogger")

class MessageLogManager extends Layer {
    constructor (debug = false) {
        super()
        this.debug = debug
    }

    async onMessage (message) {
        const guildname = message.guild.name
        const guildid = message.guild.id

        const channelname = message.channel.name ? message.channel.name : "Private"
        const channelid = message.channel.id ? message.channel.id : "XXXXXXXXXXXXXXXXXX"
        const auid = message.author.id
        
        if (this.debug) {
            log.v(`${guildname}(${guildid})/${channelname}(${channelid}) -> ${message.author.username}(${auid}): ${message.content}`)
        } else {
            log.v(`${guildname}/${channelname} -> ${message.author.username}: ${message.content}`)
        }
        return false
    }

    toString () {
        return `MessagesLogger`
    }
}

module.exports = new MessageLogManager()