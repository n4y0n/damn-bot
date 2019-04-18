const Processor = require("./interfaces/Processor")

module.exports = class CommandProcessorComponet extends Processor {
    constructor(cli) {
        super()
        this._cli = cli
    }

    async process(message) {
        await this._cli.process(message)
    }

    addCommand(command) {
        this._cli.addCommand(command)
    }
}