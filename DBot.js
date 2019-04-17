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
        this.components = []
        this.prefix = commands_prefix
        
        this.commander = new Commander(commands_prefix, {
            hooks: {
                async onFinishExecution(ok, command) {
                    if (!ok) await this.channel.send(`Error excecuting ${command}`)
                }
            }
        })

        this.on("message", async message => {
            if (message.author.id == this.user.id || !(message.channel.id == "538747728763682817")) return
            await this.commander.process(message)
            await message.delete()
        })
    }

    addCommand(command) {
        this.commander.addCommand(command)
    }

    addComponent(component) {
        component.install(this)
        this.components.push(component)
    }

    getChannel(id) {
        return this.channels.get(id)
    }
}

module.exports = DBot