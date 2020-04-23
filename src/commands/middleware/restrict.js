const log = require('../../utils/logging').getLogger("Restrict")

const restricted = ["clear", "info"];
const admin = "315437752093245441"

module.exports = async (next, command, message, ...args) => {
    if (command.name in restricted && !(message.author.id === admin)) {
        await message.react("🚩");
    } else {
        next();
    }
}