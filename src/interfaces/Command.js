//@ts-check
module.exports = class Command {
    constructor (fullcommand, options = {}) {
        const { alias = "", caseSensitive = false, description = null } = options

        this.fullcommand = fullcommand
        this.alias = !!alias ? alias : fullcommand.substr(0, 1)
        this.caseSensitive = caseSensitive
        this._description = description
    }

    exec (ctx) {
        throw new Error("Unimplemented")
    }

    undo (ctx) {
        throw new Error("Unimplemented")
    }

    toString () {
        return `${this.fullcommand}(${this.alias})`
    }

    getDescription () {
        if (!!this._description) return this._description
        return "Command Desc"
    }

    match (strcommand) {
        if (!this.caseSensitive) return (strcommand.toUpperCase() === this.fullcommand.toUpperCase() || strcommand.toUpperCase() === this.alias.toUpperCase())
        return (strcommand === this.fullcommand || strcommand === this.alias)
    }
}
