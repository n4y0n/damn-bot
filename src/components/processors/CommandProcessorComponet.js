const Processor = require("../../interfaces/Processor")
const CommandProcessor = require("../../commands/CommandProcessor")

module.exports = class CommandProcessorComponet extends Processor {
    constructor(cli) {
        super()

        this.listeningChannels = []

        if (!(cli instanceof CommandProcessor))
            throw Error(`❌ ${this.toString()} : No command processor found`)

        this._cli = cli
    }

    async process(message) {
        if(this.listeningChannels.indexOf(message.channel.id) === -1) return;
        await this._cli.process(message)
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
