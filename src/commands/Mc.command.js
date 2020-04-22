//@ts-check
const DiscordCommand = require('../interfaces/discord-command');
const log = require('../utils/logging').getLogger("Command Minecraft Stats");
const RichEmbed = require('discord.js').RichEmbed;
const axios = require('axios').default;

const httpClient = axios.create({
    baseURL: 'https://api.mcsrvstat.us/2/',
    timeout: 3000,
});

module.exports = new DiscordCommand('mctest', {
    description: 'Test minecraft server for status (default: nayon.club)'
});

module.exports.exec = async function(message, serverAddrs) {
    let server = serverAddrs || '207.180.211.96';

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
        log.w(e);
    }
    await message.channel.send(serverStatus);
};
