//@ts-check
const DiscordCommand = require('../interfaces/discord-command')
const log = require("../utils/logging").getLogger("Command INFO");

module.exports = new DiscordCommand('info', {
    description: 'DEBUG COMMAND'
})

module.exports.exec = async function (message) {
    await message.react("👌");
    const guildname = message.guild.name;
    const guildid = message.guild.id;

    const channelname = message.channel.name ? message.channel.name : "Private";
    const channelid = message.channel.id ? message.channel.id : "XXXXXXXXXXXXXXXXXX";
    const auid = message.author.id;
    
    log.v(`Guild: ${guildname}(${guildid})`);
    log.v(`Channel: ${channelname}(${channelid})`);
    log.v(`Author: ${message.author.username}(${auid})`);

    let response = await message.channel.send("See bot console for more info.");
    await response.react("😏");
}
