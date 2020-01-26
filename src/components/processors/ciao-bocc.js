//@ts-check
const Processor = require('../../interfaces/Processor')
const log = require('../../utils/logging')
const { Message } = require('discord.js')

const coseBelle = ['Ciuao', 'Hey', 'Sup', 'Felice di Bocc']
const coseBrutte = ['(＃°Д°)']

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
        // @ts-ignore
        if (!message.mentions.users.get(this.bot.user.id) && !!message.channel.name) return
        if (message.author.id !== '224977582846640128') {
            if (message.author.id === '231747075094740992') {
                await message.channel.send('WIP! Just u wait (￣_,￣ )')
                return false
            }
            await message.channel.send(generaRispostaCattiva(message.author.username))
            return false
        }
        log.info('è bocc', { location: this })
        await message.channel.send(generaRispostaBuona('') + 'Bocc!!')
        return false
    }

    toString () {
        return 'CiaoBoccProcessorComponent(' + this.getShortID() + ')'
    }
}
