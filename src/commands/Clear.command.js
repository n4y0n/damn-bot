//@ts-check
const DiscordCommand = require('../interfaces/discord-command')

module.exports = new DiscordCommand('clear', {
    alias: 'clr',
    description: 'Deletes n messages in this channel (default: 2)',
})

module.exports.exec = async function ({ react, channel }, ...args) {
    const [ limitString = "1" ] = args;
    const limit = parseInt(limitString);

    await react("👌");
    
    const msgs = await channel.fetchMessages({ limit });
    if (msgs.size === 1) return await msgs.first().delete();
    if (msgs.size < 1) return;
    await channel.bulkDelete(msgs, true);
}
