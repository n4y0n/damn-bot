const Command = require('../interfaces/Command')
const RestClient = require('../lib/RestClient')
const logger = require('../utils/logging')
const RichEmbed = require('discord.js').RichEmbed

const rc = new RestClient('https://api.mcsrvstat.us/2/')

module.exports = new Command('mctest', {
    alias: 'mct',
    description: 'Test minecraft server for status (default: nayon.club)'
})

module.exports.exec = async function (ctx) {
    const chn = ctx['chn']
    const { args } = ctx
    args.shift()
    let server = args.shift() || 'nayon.club'

    try {
        let response = await rc.Get(server)
        let data = response.data || response.response.data
        const serverStatus = new RichEmbed()

        serverStatus.setTitle('[ Server Status: ' + server + ' ]')
        serverStatus.setURL('https://mcsrvstat.us/server/'+server)

        serverStatus.setColor("#0cff05")
        if (!data.online) {
            serverStatus.setColor("#FF0c05")
        }

        serverStatus.addField('Status', data.online ? "ONLINE" : "OFFLINE")
        serverStatus.addField('Players', `${data.players.online}/${data.players.max}`)
        if(data.players.online > 0 && data.players.list) {
            let op = data.players.list.reduce((a, c) => {
                return a + ' ' + c
            })
            serverStatus.addField('Players Online', op)
        }
        await chn.send(serverStatus)
    } catch (e) {
        logger.warn(e, { location: module.exports })
    }
}
