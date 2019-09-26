//@ts-check
const Module = require('../interfaces/Module')
const logger = require('../utils/logging')

module.exports = class LogMessageModule extends Module {
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
        return `LogMessageModule(${this.getShortID()})`
    }
}
