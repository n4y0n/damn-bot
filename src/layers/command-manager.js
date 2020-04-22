//@ts-check
const Layer = require("../interfaces/Layer")
const Command = require("../interfaces/Command")
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
            const argumentList = content.split(" ");            
            const command = argumentList[0].replace(this.prefix, "");

            if (this.commands.has(command)) {
                this.commands.get(command).exec({ message }, ...argumentList);
                return true;
            }
        }
        
        return false;
    }

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
