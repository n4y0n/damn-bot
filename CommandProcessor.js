const Command = require("./Command")
const path = require("path")
const logger = require("./utils/logging")

module.exports = class CommandProcessor {
    constructor(prefix = "", options = { hooks: { onFinishExecution: null, onStartExecution: null } }) {
        this.commands = []
        this.prefix = prefix
        this.hooks = options.hooks
    }

    addCommand(command) {
        if (!(command instanceof Command)) return logger.warn(`❌ ${__filename.split(path.sep).pop()}: ${command} is not a command`, { location: this })
        this.commands.push(command)
        logger.info(`✔ Added command >> ${command}`, { location: this })
    }

    async process(message) {
        const start = Date.now()
        const args = message.content.split(" ")

        if (args <= 0) {
            logger.warn(`❌ Message with no content`, { location: this })
            return
        }
        if (!args[0].toUpperCase().startsWith(this.prefix)) {
            logger.warn(`❌ Not a command: ${message.content}`, { location: this })
            return
        }

        const cmd = args.shift().substr(this.prefix.length)

        for (const com of this.commands) {
            if (com.match(cmd)) {
                try {
                    this._startCommandExecutionHook({ message, proc: this }, com)
                    await com.exec({ message, proc: this }, args)
                } catch (e) {
                    logger.warn(`❌ Error executing command: ${command}: ${e}`, { location: this })
                    this._endCommandExecutionHook({ message, proc: this }, false, com)
                } finally {
                    logger.info(`✔ Command took ${Date.now() - start}ms to execute`, { location: this })
                    this._endCommandExecutionHook({ message, proc: this }, true, com)
                    return
                }
            }
        }
        this._endCommandExecutionHook({ message, proc: this }, false, cmd)
        logger.warn(`❌ No command "${cmd}"`, { location: this })
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
