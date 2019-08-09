const Command = require('../interfaces/Command')

module.exports = new Command('clear', {
  alias: 'clr',
  description: 'Deletes n messages in this channel (default: 2)'
})
module.exports.exec = async function (ctx) {
  const { args } = ctx
  const [command, num = 2] = args
  const channel = ctx[Symbol.for('channel')]

  const msgs = await channel.fetchMessages({ limit: num, })
  if (msgs.size === 1) return await msgs.first().delete()
  if (msgs.size < 1) return
  await channel.bulkDelete(msgs, true)
}