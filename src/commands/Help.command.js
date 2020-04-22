//@ts-check
const { RichEmbed } = require('discord.js')
const DiscordCommand = require('../interfaces/discord-command')
const LayeredBot = require("../dbot");

module.exports = new DiscordCommand('help', {
    description: 'Lists all available commands.'
})

module.exports.exec = async function ({channel}) {
    const commandlist = new RichEmbed()
    commandlist.setTitle('[ Command List ]')
    const commands = LayeredBot.getInstance().commands()

    for (const command of commands) {
        commandlist.addField(command.toString(), command.getDescription())
    }
    await channel.send(commandlist)
}
