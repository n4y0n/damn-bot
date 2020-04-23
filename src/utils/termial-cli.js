//@ts-check
const isDocker = require("is-docker")
const readline = require("readline")
const log = require("./logging").getLogger("CliManager")


// TODO: use same interface for sending text to : screen - discord chat

/**
 * Initializes terminal cli interface if not in a docker container
 * @param { string } channel
 */
module.exports = class CliManager {
    bot = null;
    output = null;
    input = null;

    constructor(bot, in_, out) {
        this.bot = bot;
        this.input = in_;
        this.output = out;
    }

    static async create(bot) {
        if (isDocker()) return

        // await bot.channels.get('538747728763682817') //'670943087807299607'//

        readline.createInterface({
            input: process.stdin,
            output: process.stdout
        }).on("line", async line => {
        });

    }
}