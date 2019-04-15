const { Client } = require("discord.js")
const Commander = require("./Commander")

class DBot extends Client {
    /**
     * 
     * @param {string} commands_prefix prefix for all commands
     * @param {Object} options
     */
    constructor(commands_prefix = "-", options) {
        super(options)
        this.prefix = commands_prefix
        this.commander = new Commander(commands_prefix, {
            hooks: {
                async onFinishExecution(ok, command) {
                    if(!ok) await this.channel.send(`Error excecuting ${command}`)
                }
            }
        })

        this.on("message", async message => {
            if (message.author.id == this.user.id || !(message.channel.id == "538747728763682817")) return
            await this.commander.process(message)
            await message.delete()
        })
    }

    addCommand(command, listener, errorlistener = null) {
        this.commander.addCommand(command, listener, errorlistener)
    }
}

module.exports = DBot