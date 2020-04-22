//@ts-check
const Layer = require("../interfaces/Layer")
const log = require('../utils/logging').getLogger("CommandManager")

module.exports = class CommandManager extends Layer {
    commands = new Map();
    prefix = "";

    constructor () {
        super();
    }

    async onMessage (message) {
        const { content } = message;

        if (content.substr(0, this.prefix.length) === this.prefix || !this.prefix) {
            const [commandString, ...argumentList] = content.split(" ");            
            const command = commandString.replace(this.prefix, "");

            if (this.commands.has(command)) {
                log.d("Recieved comand.");
                log.d(content);
                await this.commands.get(command).exec(message, ...argumentList);
                log.d("-".repeat(20));
                return true;
            }
        }
        
        return false;
    }

    entries() { return this.commands.entries(); }

    toString () {
        return `CommandManager(prefix="${this.prefix}")`
    }

    static create({ prefix = "", commands = [] }) {
        const cm = new CommandManager();
        cm.prefix = prefix;
        cm.commands = new Map(commands.map(c => ([c.name, c])));
        return cm;
    }
}
