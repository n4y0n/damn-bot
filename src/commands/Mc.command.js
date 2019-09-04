const Command = require('../interfaces/Command')
const RestClient = require('../lib/RestClient')

const rc = new RestClient('https://api.mcsrvstat.us/2/')

module.exports = new Command('mctest', {
    alias: 'mct',
    description: 'Test minecraft server for status (default: nayon.club)'
})

module.exports.exec = async function (ctx) {
    const { args } = ctx
    const chn = ctx['chn']

    console.log(args)
}
