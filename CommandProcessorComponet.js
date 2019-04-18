const Processor = require("./interfaces/Processor")
const CommandProcessor = require("./CommandProcessor")

module.exports = class CommandProcessorComponet extends Processor {
    constructor(cli) {
        super()
        
        if (!(cli instanceof CommandProcessor)) 
            return console.error(`❌ [${this.toString()}] No command processor found`)
            
        this._cli = cli
    }

    async process(message) {
        await this._cli.process(message)
    }

    addCommand(command) {
        this._cli.addCommand(command)
    }

    toString() {
        return `CommandProcessorComponet(${this.getID()})`
    }
}