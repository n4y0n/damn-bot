const Command = require("../base/Command")

module.exports = class CleanCommand extends Command {
    constructor() {
        super("clean", "c", {
            description: "Deletes n messages send by this bot (default: 1)"
        })
    }

    async listener([ num ]) {
        
        if (!num) num = 1
        const channel = this.message.channel

        const msgs = await channel.fetchMessages({ limit: num })
        let ms = msgs.filter(m => m.author.id === bot.user.id)
        if (ms.size === 1) return await ms.first().delete()
        if (ms.size < 1) return

        await channel.bulkDelete(ms, true)
    }
}