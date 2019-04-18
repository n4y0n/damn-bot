
module.exports = class CommandProcessor {
    constructor(prefix = "", options = { hooks: { onFinishExecution: null, onStartExecution: null } }) {
        this.commands = []
        this.prefix = prefix
        this.hooks = options.hooks
    }

    addCommand(command) {
        this.commands.push(command)
    }

    async process(message) {
        const start = Date.now()
        const args = message.content.split(" ")

        if (args <= 0) {
            console.error("Message with no content")
            return
        }
        if (!args[0].toUpperCase().startsWith(this.prefix)) {
            console.log(`Not a command: ${message.content}`)
            return
        }

        const cmd = args.shift().substr(this.prefix.length)

        for (const com of this.commands) {
            if (com.match(cmd)) {
                try {
                    this._startCommandExecutionHook(message, com)
                    await com.exec(message, args)
                } catch (e) {
                    console.error(`Error executing command: ${command}: ${e}`)
                    this._endCommandExecutionHook(message, false, com)
                } finally {
                    console.log(`Command took ${Date.now() - start}ms to execute`)
                    this._endCommandExecutionHook(message, true, com)
                    return
                }
            }
        }
        this._endCommandExecutionHook(message, false, cmd)
        console.error(`No command "${cmd}"`)
    }


    _startCommandExecutionHook(thisarg, ...args) {
        if (this.hooks.onStartExecution && this.hooks.onStartExecution instanceof Function) {
            this.hooks.onStartExecution.call(thisarg, ...args)
        }
    }
    _endCommandExecutionHook(thisarg, ...args) {
        if (this.hooks.onFinishExecution && this.hooks.onFinishExecution instanceof Function) {
            this.hooks.onFinishExecution.call(thisarg, ...args)
        }
    }

    toString() {
        return `CommandProcessor(${this.prefix})`
    }
}
