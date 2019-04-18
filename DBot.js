const { Client } = require("discord.js")
const Processor = require("./interfaces/Processor")
const Component = require("./interfaces/Component")

class DBot extends Client {

    /**
     * 
     * @param {Object} options
     */
    constructor(options) {
        super(options)
        this.components = {}

        this.on("message", async message => {
            if (message.author.id == this.user.id || !(message.channel.id == "538747728763682817")) return
            for(const key in this.components) {
                const component = this.components[key]
                if (component instanceof Processor)
                    await component.process(message)
            }
            await message.delete()
        })
    }

    addComponent(component) {
        if (!(component instanceof Component)) return console.error(`[${this}] ❌ ${component} id not a componet`)
        if (component === this.components[component.getID()]) return console.error(`[${this}] ❌ ${component} already installed`)
        component.install(this)
        this.components[component.getID()] = component
        console.log(`[${this}] ✔ Added Component >> ${component}`)
    }

    removeComponent(component) {
        if (!(component instanceof Component)) return console.error(`[${this}] ❌ ${component} is not a componet`)
        const retrivedcomponent = this.components[component.getID()]
        if (retrivedcomponent == null) return console.error(`[${this}] ❌ ${component} not installed in this bot`)
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