const crypto = require("crypto")
function genid() {
    const sha1 = crypto.createHash("sha1")
    sha1.update(Date.now().toString())
    return sha1.digest("hex")
}

module.exports = class Component {
    constructor() {
        this._id = genid()
        this.installed = false
        this.bot = null    
    }

    install(bot) {
        this.bot = bot
        this.installed = true
    }

    uninstall(bot) {
        this.bot = null
        this.installed = false
    }

    isInstalled() {
        return this.installed
    }

    async _cleanUp() {
        console.warn("❌🔧To implement (_cleanUp in Component superclass)🔧❌")
    }

    getID() {
        return this._id
    }

    toString() {
        return `-Component-@${this.getID()}`
    }
}