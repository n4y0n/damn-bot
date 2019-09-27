// if (message.content.substr(0, this._prefix.length) === this._prefix || !this._prefix) {
const Module = require("../interfaces/Module")
const EventEmitter = require('events').EventEmitter

// Mi annoio e voglio provare il Builder pattern

class DispatcherModule extends Module {
    constructor(dispatcherBuilder) {
        super()
        this.usesCommands = dispatcherBuilder.UseCommands
        this.commandsPrefix = dispatcherBuilder.CommandsPrefix

        this.useCommandBus = dispatcherBuilder.UseCommandBus
        this.commandBus = dispatcherBuilder.CommandBus

        this.useMessagesBus = dispatcherBuilder.UseMessagesBus
        this.messagesBus = dispatcherBuilder.MessagesBus
    }

    getCommandBus() {
        if (this.useCommandBus)
            return this.commandBus
    }

    getMessagesBus() {
        if (this.useMessagesBus)
            return this.messagesBus
    }

    register(bus) {
        super.register(bus)
        bus.on('bot-message', message => {
            if (this.usesCommands) {
                if (message.content.substr(0, this.commandsPrefix.length) === this.commandsPrefix) {
                    this.commandBus.emit('command', message)
                }
            }
            if (this.useMessagesBus) {
                this.messagesBus.emit('bot-message', message)
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

    withCommandBus() {
        this.UseCommandBus = true
        this.CommandBus = new EventEmitter()
        return this
    }

    withMessagesBus() {
        this.UseMessagesBus = true
        this.MessagesBus = new EventEmitter()
        return this
    }

    build() {
        return new DispatcherModule(this)
    }
}

module.exports = () => new DispatcherModuleBuilder()