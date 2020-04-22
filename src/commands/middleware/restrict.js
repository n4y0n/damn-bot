const log = require('../../utils/logging').getLogger("Restrict")

module.exports = (next, message, ...args) => {
    log.i("restrict")
    next(message, ...args)
}