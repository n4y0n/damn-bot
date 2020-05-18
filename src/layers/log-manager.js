//@ts-check
const Layer = require('../interfaces/Layer')
const fs = require('fs')
const log = require('../utils/logging').getLogger("MessageLogger")

function appendLog(message) {
    fs.appendFileSync("../../logs/messages.log", message);
}

class MessageLogManager extends Layer {
    constructor (debug = true) {
        super()
        this.debug = debug
    }

    async onMessage (message) {
        const guildname = message.guild.name
        const guildid = message.guild.id

        const channelname = message.channel.name ? message.channel.name : "Private"
        const channelid = message.channel.id ? message.channel.id : "XXXXXXXXXXXXXXXXXX"
        const auid = message.author.id
        
        let messageText = ""
        if (this.debug) {
            messageText = `${guildname}(${guildid})/${channelname}(${channelid}) -> ${message.author.username}(${auid}): ${message.content}`;
        } else {
            messageText = `${guildname}/${channelname} -> ${message.author.username}: ${message.content}`
        }
        log.v(messageText);
        appendLog(messageText);
        return false
    }

    toString () {
        return `MessagesLogger`
    }
}

module.exports = new MessageLogManager()