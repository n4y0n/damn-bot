//@ts-check
const { RichEmbed } = require('discord.js')
const Command = require('../interfaces/Command')

module.exports = new Command('helpgatari', {
    alias: 'fffuckk',
    description: 'Lists Monogatari watch order'
})

module.exports.exec = async function (ctx) {
    const channel = ctx['chn']
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
    await channel.send(rm)
}
