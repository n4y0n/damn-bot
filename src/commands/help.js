//@ts-check
const { RichEmbed } = require('discord.js')
const DiscordCommand = require('../interfaces/discord-command')
const log = require("../utils/logging").getLogger("Command Help")

module.exports = bot => {
    const command = new DiscordCommand('help', {
        description: 'Lists all available commands.'
    });

    command.exec = async function (message) {
        const commandlist = new RichEmbed()
        commandlist.setTitle('[ Command List ]')
        const commands = bot.commands;
        await message.react("👌");
    
        for (const [key, command] of commands.entries()) {
            commandlist.addField(key, command.getDescription())
        }
        await message.channel.send(commandlist)
    }

    return command;
}
