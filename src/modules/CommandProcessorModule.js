//@ts-check
const Module = require("../interfaces/Module")
const CommandProcessor = require("../commands/CommandProcessor")
const logger = require('../utils/logging')

const fs = require('fs')
const p = require('path')

module.exports = class CommandProcessorModule extends Module {
    constructor (prefix = "", cli = null, extra) {
        super()

        if (!(cli instanceof CommandProcessor)) {
            this._cli = new CommandProcessor(prefix)
        } else {
            this._cli = cli
        }

        this._prefix = prefix
        this._ctxextra = extra || {}
    }

    static MakeProcessor (prefix, cli, extra) {
        return new CommandProcessorModule(prefix, cli, extra)
    }

    CreateContext (message) {
        let ctx = {}
        ctx["chn"] = message.channel
        ctx["proc"] = this._cli
        ctx["ext"] = this._ctxextra
        ctx["args"] = [...message.content.split(" ")]
        return ctx
    }

    register (bus) {
        super.register(bus)
        bus.on('command', async message => {
            const context = this.CreateContext(message)
            await this._cli.process(message, context)
        })
        return this
    }

    autoload (path) {
        let dir = false
        try {
            dir = fs.lstatSync(path).isDirectory()
        } catch (e) {
            // Ignoring the error, everything is fine
            dir = false
            logger.warn(e.message, { location: this })
        }
        if (!dir) {
            logger.error('Autoload commands needs a directory!', { location: this })
            return
        }

        let files = fs.readdirSync(path)

        for (let f of files) {
            let fullpath = p.join(path, f)
            let sf = fs.lstatSync(fullpath)
            if (sf.isDirectory()) return
            try {
                this.addCommand(require(fullpath))
            } catch (e) {
                logger.warn('Cannot load command file: ' + f, { location: this })
            }
        }
    }

    addCommand (command) {
        this._cli.addCommand(command)
        return this
    }

    toString () {
        return `CommandProcessorModule(${!!this._prefix ? this._prefix : this.getShortID()})`
    }
}
