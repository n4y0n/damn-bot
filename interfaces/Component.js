const crypto = require("crypto")
function genid() {
    const sha1 = crypto.createHash("sha1")
    sha1.update(Date.now().toString())
    return sha1.digest("hex")
}

const logger = require("../utils/logging")

module.exports = class Component {
    constructor() {
        this._id = null
        this.installed = false
        this.bot = null
    }

    install(bot) {
        if (this.isInstalled())
            return logger.warn(`Component already installed in bot: ${this.bot}`, { location: this })

        this.bot = bot
        this.installed = true
    }

    uninstall() {
        if (!this.isInstalled())
            return logger.warn("Cannot uninstall a not installed component", { location: this })

        this.bot = null
        this.installed = false
    }

    isInstalled() {
        return this.installed
    }

    botReady() {
        return !!this.bot.readyTimestamp
    }

    async _cleanUp() {
        logger.warn("❌🔧To implement (_cleanUp in Component superclass)🔧❌", { location: this })
    }

    getID() {
        if (!this._id) {
            this._id = genid()
            return this._id
        }
        return this._id
    }

    getShortID() {
        return this.getID().substr(0, 7)
    }

    toString() {
        return `Component@${this.getShortID()}`
    }
}