//@ts-check
const crypto = require('crypto')
const EventEmitter = require('events').EventEmitter

function genid () {
    const sha1 = crypto.createHash("sha1")
    sha1.update(Date.now().toString())
    return sha1.digest("hex")
}

const logger = require("../utils/logging")

module.exports = class Module {
    constructor () {
        this._id = null
    }

    async _cleanUp () {
        logger.warn("❌🔧To implement🔧❌", { location: this })
    }

    get ID () {
        return this.getID()
    }

    get ShortID () {
        return this.getShortID()
    }

    /**
     * @param {EventEmitter} bus 
     */
    register(bus) {
        if (!(bus instanceof EventEmitter)) throw new Error('Bus is not an EventEmitter')
        this.bus = bus
        return this
    }

    getID () {
        if (!this._id) {
            this._id = genid()
        }
        return this._id
    }

    getShortID () {
        return this.getID().substr(0, 7)
    }

    toString () {
        return `Component@${this.getShortID()}`
    }
}
