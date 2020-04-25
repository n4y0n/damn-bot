//@ts-check
const start = Date.now()
require('dotenv').config()
const isDocker = require("is-docker")
const Cli = require("./utils/termial-cli")

const log = require('./utils/logging').getLogger("EntryPoint")

const CommandManager = require('./layers/command-manager');
const restrict = require('./commands/middleware/restrict');

const LayeredBot = require('./DBot')

let bot = LayeredBot.getInstance({
    disabledEvents: ['TYPING_START'],
    messageCacheMaxSize: 25,
    messageCacheLifetime: 120,
    messageSweepInterval: 120
});

const commands = [
    require('./commands/clear'), 
    require('./commands/help')(bot),
    require('./commands/feed')(bot),
    require('./commands/helpgatari'),
    require('./commands/mctest'),
    require('./commands/info')
]

bot.addLayer(CommandManager.create({ prefix: '-', commands })
    .use(restrict),
    "commands"
);

bot.on('ready', async () => {
    bot.addLayer(require('./layers/log-manager'));
    if (!isDocker()) Cli.init(bot);
    log.i('Bot took: ' + (Date.now() - start) + 'ms 🤖');
})

bot.on('error', err => {
    log.e(err.message);
    process.exit(-1);
})

bot.login(process.env.TOKEN)
    .catch(err => {
        log.e(err.message);
        process.exit(-1);
    })
