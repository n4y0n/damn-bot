//@ts-check
require('dotenv').config()

const log = require('./utils/logging').getLogger("EntryPoint")

const CommandManager = require('./layers/command-manager')

const LayeredBot = require('./DBot')

const start = Date.now()
let bot = LayeredBot.getInstance({
    disabledEvents: ['TYPING_START'],
    messageCacheMaxSize: 25,
    messageCacheLifetime: 120,
    messageSweepInterval: 120
});

const commands = [require('./commands/Clear.command'), ]

bot.addLayer(CommandManager.create({ prefix: '-', commands }), "commands");

bot.on('ready', async () => {
    bot.addLayer(require('./layers/log-manager'), 0)
    log.i('Bot took: ' + (Date.now() - start) + 'ms ✔')
})

bot.on('error', err => {
    log.e(err.message)
    process.exit(-1)
})

bot.login(process.env.TOKEN)
    .catch(err => {
        log.e(err.message)
        process.exit(-1)
    })
