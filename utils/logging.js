const winston = require("winston")
const { format } = winston
const { printf } = format
const moment = require("moment")

module.exports = winston.createLogger({
    format: printf((info) => {
        if(info.location) return `[${moment().format("DD/MM/YYYY HH:mm:ss")}] [${info.level.toUpperCase()}] [${info.location}] > ${info.message}`
        return `[${moment().format("DD/MM/YYYY HH:mm:ss")}] [${info.level.toUpperCase()}] > ${info.message}`
    }),
    transports: [
        new winston.transports.File({
            level: 'silly',
            filename: './logs/all-logs.log',
            handleExceptions: true,
            json: true,
            maxsize: 5242880, //5MB
            maxFiles: 5,
            colorize: false
        }),
        new winston.transports.Console({
            level: 'debug',
            handleExceptions: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: true
})

module.exports.stream = {
    write: function(message, encoding){
        logger.info(message)
    }
}