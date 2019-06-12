const { Client, Message } = require("discord.js")

module.exports = class EnhancedClient extends Client {
    addComponent(component) {
        throw new Error("Uninplemented")
    }

    removeComponent(component) {
        throw new Error("Uninplemented")
    }

    getChannel(id) {
        return this.channels.get(id)
    }

    /**
     * 
     * @param {(message: Message) => void} listener 
     */
    onMessage(listener) {
        this.on("message", listener)
    }

    toString() {
        return "Enhanced Discord.js Client"
    }
}