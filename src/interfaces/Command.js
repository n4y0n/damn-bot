
module.exports = class Command {
    constructor(fullcommand, options = { alias: "", caseSensitive: false, description: null }) {
        this.fullcommand = fullcommand
        this.alias = !!options.alias ? options.alias : fullcommand.substr(0, 1)
        this.caseSensitive = options.caseSensitive
        this._description = options.description
    }

    exec(ctx) {
        throw new Error("Unimplemented")
    }

    undo(ctx) {
        throw new Error("Unimplemented")
    }

    toString() {
        return `${this.fullcommand}(${this.alias})`
    }

    getDescription() {
        if (!!this._description) return this._description
        return "Command Desc"
    }

    match(strcommand) {
        if (!this.caseSensitive) return (strcommand.toUpperCase() === this.fullcommand.toUpperCase() || strcommand.toUpperCase() === this.alias.toUpperCase())
        return (strcommand === this.fullcommand || strcommand === this.alias)
    }
}
