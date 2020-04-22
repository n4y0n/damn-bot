//@ts-check
const { RichEmbed } = require('discord.js')
const DiscordCommand = require('../interfaces/discord-command')

module.exports = new DiscordCommand('helpgatari', {
    description: 'Lists Monogatari watch order'
})

module.exports.exec = async function (message) {
    await message.react("👌");
    let rm = new RichEmbed()
    rm.setTitle('[ Hey don\'t panic! ]')
    rm.addField("1)", "Bakemonogatari\n---")
    rm.addField("2)", "Nisemonogatari\n---")
    rm.addField("3)", "Nekomonogatari (kuro)\n---")
    rm.addField("4) Monogatari Series S2", "Nekomonogatari (shiro)\n" +
        "Kabukimonogatari\n" +
        "Otorimonogatari\n" +
        "Onimonogatari\n" +
        "Koimonogatari\n" +
        "---")
    rm.addField("5)", "Hanamonogatari\n---")
    rm.addField("6)", "Tsukimonogatari\n---")
    rm.addField("7)", "Owarimonogatari\n---")
    rm.addField("8)", "Koyomimonogatari\n---")
    rm.addField("9)", "Owarimonogatari S2\n---")
    rm.addField("10)", "Zoku Owarimonogatari\n---")
    await message.channel.send(rm)
}
