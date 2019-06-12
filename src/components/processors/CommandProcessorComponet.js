const Processor = require("../../interfaces/Processor")
const CommandProcessor = require("../../commands/CommandProcessor")

module.exports = class CommandProcessorComponet extends Processor {
    constructor(cli) {
        super()
        
        if (!(cli instanceof CommandProcessor)) 
            throw Error(`❌ ${this.toString()} : No command processor found`)
            
        this._cli = cli
    }

    async process(message) {
        if(!(message.channel.id == "538747728763682817")) return;
        await this._cli.process(message)
    }

    addCommand(command) {
        this._cli.addCommand(command)
    }

    toString() {
        return `CommandProcessorComponet(${this.getShortID()})`
    }
}