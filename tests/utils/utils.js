const RssAdapter = require("../../src/interfaces/RssAdapter")
const CommandProcessor = require("../../src/commands/CommandProcessor")
const Command = require("../../src/commands/Command")
class rss_adapter extends RssAdapter {
    constructor() {
        super()
    }
    onArticle(callback) {
    }
    onError(callback) {
    }
    run(callback) {
    }
    destroy() {
    }
}

/**
 * Mock a simple command processor cli
 * @param { { prefix: string, commands: { [string:Function] } } } options
 */
function MockCli(options = { prefix: "-", commands: {} }) {
    const {
        commands,
        prefix
    } = options

    const cli = new CommandProcessor(prefix)

    for (const [command, listener] of Object.entries(commands)) {
        cli.addCommand(new Command(command, { listener }))
    }

    return cli
}

/**
 * Mock a simple message for a cli
 * @param { { content: string, channel: string, respond: Function } } options
 */
function MockMessage(options = { content: "", channel: "", respond: null }) {
    const {
        content,
        channel,
        respond
    } = options

    return {
        content,
        channel: {
            id: channel,
            send: respond
        }
    }
}


module.exports = {
    MockRssAdapter() {
        return new rss_adapter()
    },
    MockCli,
    MockMessage
}
