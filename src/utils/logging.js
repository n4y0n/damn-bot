//@ts-check
const winston = require("winston")
const { format } = winston
const { printf } = format
const moment = require("moment")
const isDocker = require("is-docker")
const path = require("path")

module.exports = (function () {

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

    return logger
})()

module.exports.stream = {
    write: function (message, encoding) {
        module.exports.info(message)
    }
}
