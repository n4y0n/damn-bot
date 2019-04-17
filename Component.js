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
        return this.installed && this.bot
    }

    async _cleanUp() {console.warn("To implement (_cleanUp in Component superclass)")}
}