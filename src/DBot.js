//@ts-check
const { Client } = require("discord.js")
const log = require("./utils/logging").getLogger("LayeredBotCore");

const instance = null;

module.exports = class DBot extends Client {

    layers = []

    layersAlias = new Map();

    constructor (options) {
        super(options)
        this.on("message", async message => {
            if (message.author.id == this.user.id) return
            for(let layer of this.layers) {
                if (layer.onMessage(message)) break;
            }
        })
    }

    addLayer(layer, options) {
        let index = null;
        let alias = null;
        if (options instanceof Object) {
            index = options.index;
            alias = options.alias;
        }
        if (options instanceof Number) index = options;
        if (options instanceof String) alias = options;


        log.d("Added layer - " + layer + " ✔");
        if(index) {
            if (index >= this.layers.length) index = this.layers.length - 1;
            this.layers.splice(index, 0, this.layers);
            if (alias) this.layersAlias.set(alias, layer);
        } else {
            this.layers.push(layer);
            if (alias) this.layersAlias.set(alias, layer);
        }
    }

    toString () {
        return "LayeredBot"
    }

    static getInstance(options) {
        if (instance) return instance;
        return new DBot(options);
    }
}
