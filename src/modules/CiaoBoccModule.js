//@ts-check
const Module = require('../interfaces/Module')
const log = require('../utils/logging')

const coseBelle = ['Ciuao', 'Hey', 'Sup', 'Felice di Bocc']
const coseBrutte = ['Sup']

function generaRispostaCattiva (name) {
    const rngBrutto = Math.floor(Math.random() * coseBrutte.length)
    return `${coseBrutte[rngBrutto]} ${name}`
}

function generaRispostaBuona (name) {
    const rngBello = Math.floor(Math.random() * coseBelle.length)
    return `${coseBelle[rngBello]} ${name}`
}

module.exports = class CiaoBoccModule extends Module {

    static MakeCiaoBocc () {
        return new CiaoBoccModule()
    }

    register (bus) {
        super.register(bus)
        bus.on('bot-message',
            async message => {
                if (message.author.bot) return
                // FIXME: PLZ FIX ME
                if (!message.mentions.users.find(e => e.username === 'Seylum' && e.discriminator === '9356') && message.channel.name) return

                if (message.author.id === '224977582846640128') {
                    log.info('è bocc', { location: this })
                    await message.channel.send(generaRispostaBuona('') + 'Bocc!!')
                }
                if (message.author.id === '231747075094740992') {
                    await message.channel.send('WIP! Just u wait (￣_,￣ )')
                }
                await message.channel.send(generaRispostaCattiva(message.author.username))
            })
        return this
    }

    toString () {
        return 'CiaoBoccModule(' + this.getShortID() + ')'
    }
}
