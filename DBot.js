const { Client } = require("discord.js")
const Processor = require("./interfaces/Processor")
const Component = require("./interfaces/Component")
const logger = require("./utils/logging")


class DBot extends Client {

    /**
     * 
     * @param {Object} options
     */
    constructor(options) {
        super(options)
        this.components = {}

        this.on("message", async message => {
            const channelname = message.channel.name ? message.channel.name : "Private"
            logger.verbose(`New Message from ${message.author.username} in ${channelname}: ${message.content}`, { location: this })
            if (message.author.id == this.user.id || !(message.channel.id == "538747728763682817")) return
            for (const key in this.components) {
                const component = this.components[key]
                if (component instanceof Processor)
                    await component.process(message)
            }
        })
    }

    addComponent(component) {
        if (!(component instanceof Component)) return logger.warn(`❌ ${component} is not a componet`, { location: this })
        if (component === this.components[component.getID()]) return logger.info(`❌ ${component} already installed`, { location: this })
        component.install(this)
        this.components[component.getID()] = component
        logger.info(`✔ Added Component >> ${component}`, { location: this })
    }

    removeComponent(component) {
        if (!(component instanceof Component)) return logger.warn(`❌ ${component} is not a componet`, { location: this })
        const retrivedcomponent = this.components[component.getID()]
        if (retrivedcomponent == null) return logger.warn(`❌ ${component} not installed in this bot`, { location: this })
        this.components[component.getID()] = null
        retrivedcomponent.uninstall(this)
    }

    getChannel(id) {
        return this.channels.get(id)
    }

    toString() {
        return "MyBot"
    }
}

module.exports = DBot