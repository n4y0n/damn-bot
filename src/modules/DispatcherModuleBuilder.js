// if (message.content.substr(0, this._prefix.length) === this._prefix || !this._prefix) {
const Module = require("../interfaces/Module")

// Mi annoio e voglio provare il Builder pattern

class DispatcherModule extends Module {
    constructor(dispatcherBuilder) {
        super()
        this.usesCommands = dispatcherBuilder.UseCommands
        this.commandsPrefix = dispatcherBuilder.CommandsPrefix
        this.listenForMentions = dispatcherBuilder.ListenForMentions
        this.mentionID = dispatcherBuilder.MentionID
    }

    register(bus) {
        super.register(bus)
        bus.on('bot-message', message => {
            if (this.usesCommands) {
                if (message.content.substr(0, this.commandsPrefix.length) === this.commandsPrefix) {
                    bus.emit('command', message)
                }
            }
        })
        return this
    }
}

class DispatcherModuleBuilder {
    usesCommands(boolval) {
        this.UseCommands = boolval
        return this
    }

    commandsPrefix(prefix) {
        this.usesCommands(true)
        this.CommandsPrefix = prefix
        return this
    }

    build() {
        return new DispatcherModule(this)
    }
}

module.exports = () => new DispatcherModuleBuilder()