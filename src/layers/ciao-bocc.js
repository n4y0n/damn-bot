//@ts-check
const Layer = require('../interfaces/Layer')
const log = require('../utils/logging').getLogger("CiaoBocc")
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

module.exports = class CiaoBoccProcessorComponent extends Layer {
    constructor () {
        super()
    }

    /**
     *
     * @param {Message} message
     */
    async onMessage (message) {
        // @ts-ignore
        if (!message.mentions.users.get(this.bot.user.id) && !!message.channel.name) return
        if (message.author.id !== '224977582846640128') {
            if (message.author.id === '231747075094740992') {
                await message.channel.send('WIP! Just u wait (￣_,￣ )')
                return false;
            }
            await message.channel.send(generaRispostaCattiva(message.author.username))
            return false;
        }
        log.d('è bocc')
        await message.channel.send(generaRispostaBuona('') + 'Bocc!!')
        return false;
    }

    toString () {
        return 'CiaoBocc'
    }
}
