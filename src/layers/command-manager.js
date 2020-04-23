//@ts-check
const Layer = require("../interfaces/Layer")
const log = require('../utils/logging').getLogger("CommandManager")

module.exports = class CommandManager extends Layer {
    middlewares = [];
    commands = new Map();
    prefix = "";

    constructor() {
        super();
    }

    async onMessage(message) {
        const { content } = message;

        if (content.substr(0, this.prefix.length) === this.prefix || !this.prefix) {
            const [cs, ...args] = content.split(" ");
            const command = cs.replace(this.prefix, "");

            if (this.commands.has(command)) {
                log.d("Recieved comand.");
                log.d(content);

                await this.dispatch(this.commands.get(command), message, args);

                log.d("-".repeat(20));
                return true;
            }
        }

        return false;
    }

    use(middleware) {
        this.middlewares.push(middleware);
        return this;
    }

    entries() { return this.commands.entries(); }

    add(command) {
        log.i("Added command " + command + " ✔");
        this.commands.set(command.name, command);
        return this;
    }

    toString() {
        return `CommandManager(prefix="${this.prefix}")`;
    }

    static create({ prefix = "", commands = [] }) {
        const cm = new CommandManager();
        cm.prefix = prefix;
        for (const command of commands) {
            cm.add(command);
        }
        return cm;
    }

    dispatch(command, message, args) {
        var idx = 0;
        var stack = this.middlewares;
        if (stack.length === 0) {
            return command.exec(message, ...args);
        }

        return next();

        async function next(err) {
            if (err) {
                return log.e(err);
            }

            let layer = stack[idx++];
            if (!layer) {
                return command.exec(message, ...args);
            }

            await layer(next, command, message, args);
        }
    }
}