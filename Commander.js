
class Commander {
    constructor(prefix = "") {
        this.commands = []
        this.prefix = prefix
    }

    addCommand(command, listener, errorlistener = null) {
        this.commands.push({ command, listener, errorlistener })
    }

    async process(message) {
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
            if (com.command.match()) {
                try {
                    if (com.errorlistener) await com.command.exec(com.listener.bind(message), args, com.errorlistener.bind(message))
                    else await com.command.exec(com.listener.bind(message), args)
                } catch(e) {
                    console.error(e)
                } finally {
                    return
                }
            }
        }
        console.error(`No command "${cmd}"`)
        await message.channel.send(`No command "${cmd}"`)
    }
}

module.exports = Commander