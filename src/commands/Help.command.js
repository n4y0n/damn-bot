//@ts-check
const { RichEmbed } = require('discord.js')
const Command = require('../interfaces/Command')

module.exports = new Command('help', {
    description: 'Lists all available commands.'
})

module.exports.exec = async function (ctx) {
    const channel = ctx['chn']
    const commandlist = new RichEmbed()
    commandlist.setTitle('[ Command List ]')
    for (const command of ctx.proc.commands) {
        commandlist.addField(command.toString(), command.getDescription())
    }
    await channel.send(commandlist)
}
