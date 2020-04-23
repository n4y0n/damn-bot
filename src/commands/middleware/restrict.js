const log = require('../../utils/logging').getLogger("Restrict")

const restricted = new Map([["clear", 0], ["info", 1]]);
const admin = "315437752093245441"

module.exports = async (next, command, message) => {
    if (restricted.has(command.name) && message.author.id !== admin) {
        log.i("Blocked command " + command + " from " + message.author);
        await message.react("🚩");
    } else {
        await next();
    }
}