
class Command {
    constructor(fullcommand, alias = "", options = {}) {
        const {
            args_schema = null,
            caseSensitive = true
        } = options

        this.fullcommand = fullcommand
        this.alias = alias
        this.args_schema = args_schema
        this.caseSensitive = caseSensitive
    }
    async exec(executer = async (args = []) => { }, args = [], onerrorexecuter = null) {
        if (this.checkSchema(args)) {
            await executer(args)
        } else {
            console.error(`Arguments not respect the schema declared for command [${this.fullcommand}|${this.alias}]`)
            if (onerrorexecuter && onerrorexecuter instanceof Function) {
                await onerrorexecuter(err)
            }
        }
    }

    checkSchema(args = []) {
        if (!this.args_schema) return true
        //return validate(args)
    }

    match(strcommand) {
        if (!this.caseSensitive) return (strcommand.toUpperCase() === this.fullcommand.toUpperCase() || strcommand.toUpperCase() === this.alias.toUpperCase())
        return (strcommand === this.fullcommand || strcommand === this.alias)
    }
}

module.exports = Command