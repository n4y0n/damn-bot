//@ts-check
const DiscordCommand = require('../interfaces/discord-command')
const log = require("../utils/logging").getLogger("ClearCommand");

module.exports = new DiscordCommand('clear', {
    alias: 'clr',
    description: 'Deletes n messages in this channel (default: 2)',
})

module.exports.exec = async function (message , ...args) {
    const [ limitString = "2" ] = args;
    const limit = parseInt(limitString);

    log.i(limit)
    await message.react("👌");
    
    const msgs = await message.channel.fetchMessages({ limit: limit });
    if (msgs.size === 1) return await msgs.first().delete();
    if (msgs.size < 1) return;
    await message.channel.bulkDelete(msgs, true);
}
