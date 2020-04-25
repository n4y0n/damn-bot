//@ts-check
module.exports = class DiscordCommand {
    constructor (name, options = {}) {
        const { description = null } = options

        this.name = name;
        this._description = description
    }

    async exec (ctx) {
        throw new Error("Unimplemented")
    }

    async undo (ctx) {
        throw new Error("Unimplemented")
    }

    toString () {
        return `Command(name="${this.name}")`
    }

    getDescription () {
        return this._description ?  this._description : "Command Desc"
    }
}
