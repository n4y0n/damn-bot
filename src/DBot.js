//@ts-check
const { Client } = require("discord.js")
const log = require("./utils/logging").getLogger("LayeredBotCore");

class DBot extends Client {

    layers = []

    layersAlias = new Map();

    constructor (options) {
        super(options)
        this.on("message", async message => {
            if (message.author.id == this.user.id) return
            for(let layer of this.layers) {
                if (await layer.onMessage(message)) break;
            }
        })
    }

    get commands() { return this.layersAlias.get("commands"); }

    addLayer(layer, options) {
        let index = null;
        let alias = null;

        if (typeof options === 'number') { index = options; }
        else if (typeof options === 'string') { alias = options; }
        else if (typeof options === 'object') {
            index = options.index;
            alias = options.alias;
        }

        log.d("Added layer - " + layer + " ✔");
        if(index) {
            if (index >= this.layers.length) index = this.layers.length - 1;
            this.layers.splice(index, 0, this.layers);
        } else {
            this.layers.push(layer);
        }

        if (alias) { this.layersAlias.set(alias, layer); }
    }

    toString () {
        return "LayeredBot"
    }
}


let instance = null;
module.exports = DBot;
module.exports.getInstance = options => {
    if (instance !== null) { return instance; }
    instance = new DBot(options);
    return instance;
}
