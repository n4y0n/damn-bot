const crypto = require("crypto")
const { Client } = require("discord.js")
const Processor = require("./interfaces/Processor")
const Component = require("./interfaces/Component")

function circular(object) {
    var i = 0;

    return function (key, value) {
        if (i !== 0 && typeof (object) === 'object' && typeof (value) == 'object' && object == value)
            return '[Circular]';

        if (i >= 29) // seems to be a harded maximum of 30 serialized objects?
            return '[Unknown]';

        ++i; // so we know we aren't using the original object anymore

        return value;
    }

}

function getkey(objtohash) {
    const sha1 = crypto.createHash("sha1")
    const stringthis = JSON.stringify(objtohash, circular(objtohash))
    sha1.update(stringthis)
    return sha1.digest("hex")
}

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
        if (!(component instanceof Component)) return console.error(`${component} id not a componet`)
        component.install(this)
        this.components[getkey(component)] = component
    }

    removeComponent(component) {
        if (!(component instanceof Component)) return console.error(`${component} is not a componet`)
        const key = getkey(component)
        const retrivedcomponent = this.components[key]
        if (retrivedcomponent == null) return console.error(`${component} not installed in this bot`)
        this.components[key] = null
        retrivedcomponent.uninstall(this)
    }

    getChannel(id) {
        return this.channels.get(id)
    }
}

module.exports = DBot