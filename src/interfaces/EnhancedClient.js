const { Client, Message } = require("discord.js")

module.exports = class EnhancedClient extends Client {
    addComponent(component) {
        throw new Error("Unimplemented")
    }

    removeComponent(component) {
        throw new Error("Unimplemented")
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
