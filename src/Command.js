
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
        return "Voluptatem minus nemo aut fugit ex repudiandae. Enim velit quia vel deleniti. Rerum voluptatum officiis sed ut alias placeat voluptate qui. Magni officia molestiae reprehenderit unde sequi voluptatem."
    }

    match(strcommand) {
        if (!this.caseSensitive) return (strcommand.toUpperCase() === this.fullcommand.toUpperCase() || strcommand.toUpperCase() === this.alias.toUpperCase())
        return (strcommand === this.fullcommand || strcommand === this.alias)
    }
}