const Processor = require('../../interfaces/Processor')
const log = require('../../utils/logging')
const { Message } = require('discord.js')

const coseBelle = ['Ciuao', 'Hey', 'Sup', 'Felice di Bocc']
const coseBrutte = ['Fuck u', '(＃°Д°)']

function generaRispostaCattiva (name) {
  const rngBrutto = Math.floor(Math.random() * coseBrutte.length)
  return `${coseBrutte[rngBrutto]} ${name}`
}

function generaRispostaBuona (name) {
    const rngBello = Math.floor(Math.random() * coseBelle.length)
    return `${coseBelle[rngBello]} ${name}`
}

module.exports = class CiaoBoccProcessorComponent extends Processor {
  constructor () {
    super()
  }

  /**
   *
   * @param {Message} message
   */
  async process (message) {
    if (!message.mentions.users.get(this.bot.user.id) && !!message.channel.name) return
    if (message.author.id !== '224977582846640128') {
        if (message.author.id === '231747075094740992') {
            return await message.channel.send('WIP! Just u wait (￣_,￣ )')
        }
        return await message.channel.send(generaRispostaCattiva(message.author.username))
    }
    log.info('è bocc', { location: this })
    await message.channel.send(generaRispostaBuona('') + 'Bocc!!')
  }

  toString () {
    return 'CiaoBoccProcessorComponent(' + this.getShortID() + ')'
  }
}
