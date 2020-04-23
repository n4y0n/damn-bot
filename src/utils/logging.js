//@ts-check
const moment = require("moment")
// @ts-ignore
const isDocker = require("is-docker")
const path = require("path")

// @ts-ignore
const init = () => {
    const logger = {
        info: (message, options) => console.info(printf({ ...options, level: "info" }), ...message),
        warn: (message, options) => console.warn(printf({ ...options, level: "warn" }), ...message),
        error: (message, options) => console.error(printf({ ...options, level: "error" }), ...message),
        verbose: (message, options) => console.info(printf({ ...options, level: "verbose" }), ...message),
        debug: (message, options) => console.debug(printf({ ...options, level: "debug" }), ...message),
    }

    function printf({ location, level }) {
        return `[${moment().format("DD/MM/YYYY HH:mm:ss")}] [${location}/${level.toUpperCase()}]:`
    }

    logger.stream = {
        // @ts-ignore
        write: function (message, encoding) {
            logger.info([message])
        }
    }

    return logger
}

const logger = init()

module.exports = {
    // @ts-ignore
    getLogger(name) { 
        return {
            v: (...message) => logger.verbose(message, { location: name }),
            w: (...message) => logger.warn(message, { location: name }),
            i: (...message) => logger.info(message, { location: name }),
            e: (...message) => logger.error(message, { location: name }),
            d: (...message) => logger.debug(message, { location: name }),
        }
    }
}

module.exports.filename = (__dirname, __filename) => {
    return __filename.replace(__dirname, "").substr(1)
}