
class Command {
    constructor(fullcommand, alias = "", options = {}) {
        const {
            caseSensitive = true
        } = options

        this.fullcommand = fullcommand
        this.alias = alias
        this.caseSensitive = caseSensitive
    }
    async exec(executer = async (args = []) => { }, args = [], onerrorexecuter = null) {
        try {
            await executer(args)
        } catch(e) {
            console.error(e)
            if (onerrorexecuter && onerrorexecuter instanceof Function) {
                await onerrorexecuter(e)
            }
        }
    }

    match(strcommand) {
        if (!this.caseSensitive) return (strcommand.toUpperCase() === this.fullcommand.toUpperCase() || strcommand.toUpperCase() === this.alias.toUpperCase())
        return (strcommand === this.fullcommand || strcommand === this.alias)
    }
}

module.exports = Command