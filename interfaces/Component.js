module.exports = class Component {
    constructor() {
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

    async _cleanUp() {console.warn("To implement (_cleanUp in Component superclass)")}

    toString() {
        return `-Component-`
    }
}