//@ts-check
const DiscordCommand = require("../interfaces/discord-command")
const path = require("path")
const log = require("./logging").getLogger("CommandProcessor")

module.exports = class CommandProcessor {
    constructor (prefix = "") {
        this.commands = []
        this.prefix = prefix
    }

    addCommand (command) {
        if (!(command instanceof DiscordCommand)) {
            log.w(`❌ ${__filename.split(path.sep).pop()}: ${command} is not a command`)
            return this
        }
        this.commands.push(command)
        log.i(`✔ Added command >> ${command}`)
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
                    log.i(`✔ Done executing ${com}`)
                } catch (e) {
                    log.e(`❌ Error executing command: ${com}`)
                    log.e(e.stack)
                } finally {
                    return log.i(`   Command took ${Date.now() - start}ms to execute`)
                }
            }
        }
        log.w(`❌ No command "${cmd}"`)
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
