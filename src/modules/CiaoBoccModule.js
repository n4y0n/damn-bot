//@ts-check
const Module = require('../interfaces/Module')
const log = require('../utils/logging')
const { Message } = require('discord.js')

const coseBelle = ['Ciuao', 'Hey', 'Sup', 'Felice di Bocc']
const coseBrutte = ['Sup']

function generaRispostaCattiva(name) {
    const rngBrutto = Math.floor(Math.random() * coseBrutte.length)
    return `${coseBrutte[rngBrutto]} ${name}`
}

function generaRispostaBuona(name) {
    const rngBello = Math.floor(Math.random() * coseBelle.length)
    return `${coseBelle[rngBello]} ${name}`
}

module.exports = class CiaoBoccModule extends Module {

    register(bus) {
        super.register(bus)

        bus.on('bot-mentioned', async message => {
            // @ts-ignore
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
        })

        return this
    }

    toString() {
        return 'CiaoBoccModule(' + this.getShortID() + ')'
    }
}
