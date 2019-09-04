const Processor = require("../../interfaces/Processor")
const CommandProcessor = require("../../commands/CommandProcessor")

module.exports = class CommandProcessorComponet extends Processor {
    constructor(cli, extra) {
        super()

        this.listeningChannels = []

        if (!(cli instanceof CommandProcessor))
            throw Error(`❌ ${this.toString()} : No command processor found`)

        this._cli = cli
        this._ctxextra = extra || {}
    }

    async process(message) {
        if(this.listeningChannels.indexOf(message.channel.id) === -1 && this.listeningChannels.length > 0) return;
        const context = this.CreateContext(message)
        await this._cli.process(message, context)
    }

    CreateContext(message) {
        let ctx = {}
        ctx["chn"] = message.channel
        ctx["proc"] = this._cli
        ctx["ext"] = this._ctxextra
        ctx["args"] = [...message.content.split(" ")]
        return ctx
    }

    addCommand(command) {
        this._cli.addCommand(command)
    }

    addListenChannel(channel) {
        // TODO: Check that "channel" exists in the server and that the bot has access to it
        this.listeningChannels.push(channel)
        return this
    }

    toString() {
        return `CommandProcessorComponet(${this.getShortID()})`
    }
}
