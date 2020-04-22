//@ts-check
const winston = require("winston")
const { format } = winston
const { printf } = format
const moment = require("moment")
// @ts-ignore
const isDocker = require("is-docker")
const path = require("path")

// @ts-ignore
const init = () => {

    const level = process.env.NODE_ENV !== "production" ? "silly" : "info"

    const logger = winston.createLogger({
        format: printf((info) => {
            if (info.location) return `[${moment().format("DD/MM/YYYY HH:mm:ss")}] [${info.location}/${info.level.toUpperCase()}]: ${info.message}`
            return `[${moment().format("DD/MM/YYYY HH:mm:ss")}] [${info.level.toUpperCase()}]: ${info.message}`
        }),
        transports: [
            new winston.transports.Console({
                level: level,
                handleExceptions: true,
            })
        ],
        exitOnError: false
    })

    if (!isDocker()) {
        logger.add(new winston.transports.File({
            level: level,
            filename: path.join(__dirname, '..', '..', 'logs', 'all-logs.log'),
            handleExceptions: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
        }))
    }

    logger.stream = {
        // @ts-ignore
        write: function (message, encoding) {
            module.exports.info(message)
        }
    }

    return logger
}

const logger = init()

module.exports = {
    // @ts-ignore
    getLogger(name) { 
        return {
            v: message => logger.verbose(message, { location: name }),
            w: message => logger.warn(message, { location: name }),
            i: message => logger.info(message, { location: name }),
            e: message => logger.error(message, { location: name }),
            d: message => logger.debug(message, { location: name }),
        }
    }
}

module.exports.filename = (__dirname, __filename) => {
    return __filename.replace(__dirname, "").substr(1)
}