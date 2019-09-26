//@ts-check
const EnhancedClient = require("./interfaces/EnhancedClient")
const logger = require("./utils/logging")


// TODO: Message logger

module.exports = class BotClass extends EnhancedClient {

    /**
     *
     * @param {Object} options
     */
    constructor(options) {
        super(options)
    }

    start(token) {
        return super.start(token)
            .then(() => { logger.info('Bot started.', { location: this }) })
            .catch(e => this.bus.emit('bot-error', e))
    }

    toString() {
        return "BotClass"
    }
}
