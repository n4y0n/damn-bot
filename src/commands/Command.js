
module.exports = class Command {
    constructor(fullcommand, options = { alias: "", caseSensitive: true, listener: null, errorlistener: null, description: null }) {
        const {
            caseSensitive = true,
            listener = null,
            errorlistener = null,
            alias = "",
            description
        } = options

        if (!listener || !(listener instanceof Function)) {
            throw Error("❌ Listener must be declared and must be a function.")
        }

        this.fullcommand = fullcommand
        this.alias = !!alias ? alias : fullcommand.substr(0, 1)
        this.caseSensitive = caseSensitive
        this.listener = listener
        this.errorlistener = errorlistener
        this._description = description
    }

    async exec(thisobj, args = []) {
        try {

            if (!this.listener && !(this.listener instanceof Function))
                throw Error("❌ No listener function declared!")

            await this.listener.call(thisobj, args)

        } catch (e) {

            if (!this.errorlistener && !(this.errorlistener instanceof Function))
                throw e

            await this.errorlistener.call(thisobj, e)
        }
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
