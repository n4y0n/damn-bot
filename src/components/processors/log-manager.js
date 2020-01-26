//@ts-check
const Processor = require('../../interfaces/Processor')
const logger = require('../../utils/logging')

module.exports = class MessageLogManager extends Processor {
    constructor () {
        super()
    }

    async process (message) {
        const channelname = message.channel.name ? message.channel.name : "Private"
        const channelid = message.channel.id ? message.channel.id : "XXXXXXXXXXXXXXXXXX"
        logger.verbose(`New Message from ${message.author.username}(${message.author.id}) in ${channelname}(${channelid}): ${message.content}`, { location: this })
        return false
    }

    toString () {
        return `MessagesLog#${this.getShortID()}`
    }
}
