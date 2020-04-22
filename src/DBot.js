//@ts-check
const { Client } = require("discord.js")
const log = require("./utils/logging").getLogger("LayeredBotCore");

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
        log.d("Added layer - " + layer + " ✔");
        if(index) {
            if (index >= this.layers.length) index = this.layers.length - 1;
            this.layers.splice(index, 0, this.layers);
        } else {
            this.layers.push(layer);
        }
    }

    toString () {
        return "LayeredBot"
    }
}
