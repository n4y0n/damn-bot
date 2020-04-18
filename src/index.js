//@ts-check
require('dotenv').config()

const logger = require('./utils/logging')
const { filename } = require('./utils/logging')

const initCli = require('./utils/termial-cli')

const MyBot = require('./DBot')

const CommandManager = require('./components/listeners/command-manager')

const botChannel = '538747728763682817'//'670943087807299607'//

const start = Date.now()
let bot = new MyBot({
    disabledEvents: ['TYPING_START'],
    messageCacheMaxSize: 25,
    messageCacheLifetime: 120,
    messageSweepInterval: 120
})

bot.addComponent(
    new CommandManager('-').
        addCommand(require('./commands/Clear.command')).
        addCommand(require('./commands/Help.command')).
        addCommand(require('./commands/Mono.command')).
        addCommand(require('./commands/Mc.command'))
)

bot.on('ready', async () => {
    bot.addComponent(require('./components/listeners/log-manager'))
    initCli(bot, botChannel)

    logger.info('Bot took: ' + (Date.now() - start) + 'ms', { location: filename(__dirname, __filename) })
})

bot.on('error', err => {
    logger.error(err.message, { location: filename(__dirname, __filename) })
    process.exit(-1)
})

bot.login(process.env.TOKEN)
    .then(token => logger.info('Ok', { location: filename(__dirname, __filename) }))
    .catch(err => {
        logger.error(err.message, { location: filename(__dirname, __filename) })
        process.exit(-1)
    })
