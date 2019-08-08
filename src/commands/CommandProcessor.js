const Command = require("../interfaces/Command")
const path = require("path")
const logger = require("../utils/logging")

module.exports = class CommandProcessor {
    constructor(prefix = "") {
        this.commands = []
        this.prefix = prefix
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
            return
        }
        if (!args[0].toUpperCase().startsWith(this.prefix)) {
            logger.silly(`❌ Not a command: ${message.content}`, { location: this })
            return
        }

        const cmd = args.shift().substr(this.prefix.length)

        for (const com of this.commands) {
            if (com.match(cmd)) {
                try {

                    // FIXME: Command Context creation

                    const ctx = {}
                    ctx[Symbol.for('channel')] = message.channel
                    ctx["processor"] = this
                    ctx["args"] = [...message.content.split(" ")]

                    await com.exec(ctx)
                    logger.info(`✔ Done executing ${com}`)
                } catch (e) {
                    logger.error(`❌ Error executing command: ${com}`, { location: this })
                    logger.error(e.stack, { location: this })
                    return
                } finally {
                    logger.info(`   Command took ${Date.now() - start}ms to execute`, { location: this })
                    return
                }
            }
        }
        logger.warn(`❌ No command "${cmd}"`, { location: this })
    }

    /**
     * Returns the number of commands registred to this processor
     */
    size() {
        return this.commands.length
    }

    toString() {
        return `CommandProcessor(${this.prefix})`
    }
}
