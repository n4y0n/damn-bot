//@ts-check
const Processor = require("../../interfaces/Processor")
const CommandProcessor = require("../../commands/CommandProcessor")
const logger = require('../../utils/logging')

module.exports = class CommandProcessorComponet extends Processor {
    constructor (prefix = "", cli = null, extra) {
        super()

        this.listeningChannels = []

        if (!(cli instanceof CommandProcessor)) {
            this._cli = new CommandProcessor(prefix)
        } else {
            this._cli = cli
        }

        this._prefix = prefix
        this._ctxextra = extra || {}
    }

    async process (message) {
        if (this.listeningChannels.indexOf(message.channel.id) === -1 && this.listeningChannels.length > 0) return;
        if (message.content.substr(0, this._prefix.length) === this._prefix || !this._prefix) {
            const context = this.CreateContext(message)
            await this._cli.process(message, context)
        }
    }

    CreateContext (message) {
        let ctx = {}
        ctx["chn"] = message.channel
        ctx["proc"] = this._cli
        ctx["ext"] = this._ctxextra
        ctx["args"] = [...message.content.split(" ")]
        return ctx
    }

    addCommand (command) {
        this._cli.addCommand(command)
        return this
    }

    addListenChannel (channel) {
        // TODO: Check that "channel" exists in the server and that the bot has access to it
        this.listeningChannels.push(channel)
        return this
    }

    toString () {
        return `CommandProcessorComponet(${!!this._prefix ? this._prefix : this.getShortID()})`
    }
}
