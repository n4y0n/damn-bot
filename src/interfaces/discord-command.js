//@ts-check
module.exports = class DiscordCommand {
    constructor (name, options = {}) {
        const { description = null } = options

        this.name = name;
        this._description = description
    }

    exec (ctx) {
        throw new Error("Unimplemented")
    }

    undo (ctx) {
        throw new Error("Unimplemented")
    }

    toString () {
        return `Command(name="${this.name}")`
    }

    getDescription () {
        if (!!this._description) return this._description
        return "Command Desc"
    }
}
