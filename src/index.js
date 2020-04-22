//@ts-check
require('dotenv').config()

const log = require('./utils/logging').getLogger("EntryPoint")

const CliManager = require('./utils/termial-cli')
const CommandManager = require('./layers/command-manager')

const LayeredBot = require('./DBot')

const start = Date.now()
let bot = new LayeredBot({
    disabledEvents: ['TYPING_START'],
    messageCacheMaxSize: 25,
    messageCacheLifetime: 120,
    messageSweepInterval: 120
})

bot.addLayer(new CommandManager('-').
        addCommand(require('./commands/Clear.command')).
        addCommand(require('./commands/Help.command')).
        addCommand(require('./commands/Mono.command')).
        addCommand(require('./commands/Mc.command')))

bot.on('ready', async () => {
    bot.addLayer(require('./layers/log-manager'), 0)
    CliManager.create(bot);
    log.i('Bot took: ' + (Date.now() - start) + 'ms')
})

bot.on('error', err => {
    log.error(err.message)
    process.exit(-1)
})

bot.login(process.env.TOKEN)
    .then(token => log.i('Ok'))
    .catch(err => {
        log.e(err.message)
        process.exit(-1)
    })
