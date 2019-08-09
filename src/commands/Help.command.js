const { RichEmbed } = require('discord.js')
const Command = require('../interfaces/Command')

module.exports = new Command('help', {
  description: 'Lists all available commands.'
})
module.exports.exec = async function (ctx) {
  const channel = ctx[Symbol.for('channel')]
  const commandlist = new RichEmbed()
  commandlist.setTitle('[ Command List ]')
  for (const command of ctx.processor.commands) {
      commandlist.addField(command.toString(), command.getDescription())
  }
  await channel.send(commandlist)
}