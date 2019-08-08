const Processor = require('../../interfaces/Processor')
const log = require('../../utils/logging')
const { Message } = require('discord.js')

module.exports = class CiaoBoccProcessorComponent extends Processor {
  constructor () {
    super()
  }

  /**
   * 
   * @param {Message} message 
   */
  async process (message) {
    if (!message.mentions.users.get(this.bot.user.id)) return
    if (message.author.id !== '224977582846640128') {
      return await message.channel.send('Fuck you '+message.author.username)
    }
    log.info('è bocc', { location: this })
    await message.channel.send('Ciao Bocc!')
  }

  toString () {
    return 'CiaoBoccProcessorComponent(' + this.getShortID() + ')'
  }
}