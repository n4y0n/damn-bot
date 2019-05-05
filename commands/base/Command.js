
module.exports = class Command {
    constructor(fullcommand, alias = "", options = { caseSensitive: true, listener: null, errorlistener: null, description: null }) {
        const {
            caseSensitive = true,
            listener = null,
            errorlistener = null,
            description
        } = options

        if (!listener || !(listener instanceof Function)) {
            throw Error("❌ Listener must be declared and must be a function.")
        }

        this.fullcommand = fullcommand
        this.alias = alias
        this.caseSensitive = caseSensitive
        this.listener = listener
        this.errorlistener = errorlistener
        this._description = description
    }

    async exec(thisobj, args = []) {
        try {
            if (this.listener && this.listener instanceof Function) {
                await this.listener.call(thisobj, args)
            } else {
                throw Error("❌ No listener function declared!")
            }
        } catch (e) {
            if (this.errorlistener && this.errorlistener instanceof Function) {
                await this.errorlistener.call(thisobj, e)
            } else {
                throw e
            }
        }
    }

    toString() {
        return `${this.fullcommand}(${this.alias})`
    }

    getDescription() {
        if (!!this._description) return this._description
        return "Voluptatem minus nemo aut fugit ex repudiandae. Enim velit quia vel deleniti. Rerum voluptatum officiis sed ut alias placeat voluptate qui."
    }

    match(strcommand) {
        if (!this.caseSensitive) return (strcommand.toUpperCase() === this.fullcommand.toUpperCase() || strcommand.toUpperCase() === this.alias.toUpperCase())
        return (strcommand === this.fullcommand || strcommand === this.alias)
    }
}