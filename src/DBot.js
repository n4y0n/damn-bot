//@ts-check
const { Client } = require("discord.js")
const logger = require("./utils/logging")

module.exports = class DBot extends Client {

    layers = []

    constructor (options) {
        super(options)
        this.on("message", async message => {
            if (message.author.id == this.user.id) return
            for(let layer of this.layers) {
                if (layer.onMessage(message)) break;
            }
        })
    }

    addLayer(layer, index = null) {
        if(index) {
            this.layers.splice(index, 0, this.layers);
        } else {
            this.layers.push(layer);
        }
    }

    toString () {
        return "LayeredBot"
    }
}
