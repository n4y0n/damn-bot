//@ts-check
const Command = require("../interfaces/Command")
const path = require("path")
const logger = require("../utils/logging")

module.exports = class CommandProcessor {
    constructor (prefix = "") {
        this.commands = []
        this.prefix = prefix
    }

    addCommand (command) {
        if (!(command instanceof Command)) {
            logger.warn(`❌ ${__filename.split(path.sep).pop()}: ${command} is not a command`, { location: this })
            return this
        }
        this.commands.push(command)
        logger.info(`✔ Added command >> ${command}`, { location: this })
        return this
    }

    async process (message, ctx) {
        const start = Date.now()
        const args = message.content.split(" ")

        if (args <= 0) {
            return
        }
        if (!args[0].toUpperCase().startsWith(this.prefix)) {
            return
        }

        const cmd = args.shift().substr(this.prefix.length)

        for (const com of this.commands) {
            if (com.match(cmd)) {
                try {
                    await com.exec(ctx)
                    logger.info(`✔ Done executing ${com}`)
                } catch (e) {
                    logger.error(`❌ Error executing command: ${com}`, { location: this })
                    logger.error(e.stack, { location: this })
                } finally {
                    return logger.info(`   Command took ${Date.now() - start}ms to execute`, { location: this })
                }
            }
        }
        logger.warn(`❌ No command "${cmd}"`, { location: this })
    }

    /**
     * Returns the number of commands registred to this processor
     */
    size () {
        return this.commands.length
    }

    get length () {
        return this.size()
    }

    toString () {
        return `CommandProcessor(${this.prefix})`
    }
}
