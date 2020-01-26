//@ts-check
const Command = require('../interfaces/Command');
const logger = require('../utils/logging');
const RichEmbed = require('discord.js').RichEmbed;
const axios = require('axios').default;

const httpClient = axios.create({
    baseURL: 'https://api.mcsrvstat.us/2/',
    timeout: 3000,
});

module.exports = new Command('mctest', {
    alias: 'mct',
    description: 'Test minecraft server for status (default: nayon.club)'
});

module.exports.exec = async function(ctx) {
    const chn = ctx['chn'];
    const { args } = ctx;
    args.shift();
    let server = args.shift() || 'nayon.club';

    const serverStatus = new RichEmbed();

    serverStatus.setTitle('[ Server Status: ' + server + ' ]');
    serverStatus.setURL('https://mcsrvstat.us/server/' + server);

    serverStatus.setColor('#0cff05');

    try {
        let response = await httpClient.get(server);
        let data = response.data;

        if (!data.online) {
            throw Error(`Server: "${server}" Offline.`);
        }

        serverStatus.addField('Status', data.online ? 'ONLINE' : 'OFFLINE');
        if (data.players) {
            serverStatus.addField(
                'Players',
                `${data.players.online}/${data.players.max}`
            );
        }
        if (data.players.online > 0 && data.players.list) {
            let op = data.players.list.reduce((a, c) => {
                return a + '\n' + c;
            });
            serverStatus.addField('Players Online', op);
        }
    } catch (e) {
        serverStatus.setColor('#FF0c05');
        serverStatus.addField('Status', 'OFFLINE');
        serverStatus.addField('Players', '0/0');
        logger.warn(e, { location: module.exports });
    }
    await chn.send(serverStatus);
};
