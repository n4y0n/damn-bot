//@ts-check
const readline = require("readline")
const log = require("./logging").getLogger("CliManager")

async function init (bot) {

    const commands = new Map();

    commands.set("say", async function (bot, ...args) {
        // const channel = await bot.channels.get('538747728763682817'); //'670943087807299607'//
        // const message = await channel.send("test boi.");
        // await message.react("🙂");
        // setTimeout(async () => await message.delete(), 3000);
    });

    commands.set("hw", async function (bot, ...args) {
        log.d(args.join(" ") + " world");
    });

    const interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    interface.on("line", async line => {
        const execute = parseCommand(line);
        await execute(bot);
    });

    function parseCommand(string) {
        const [command, ...args] = parseWords(string);
        const execute = buildCommand(command, args)
        return execute;
    }

    function buildCommand(command, args = []) {
        return async bot => {
            if (commands.has(command)) {
                return commands.get(command)(bot, ...args);
            } else {
                log.i("Command \"" + command + "\" not found");
            }
        }
    }

    function parseWords(string) {
        let strings = [];
        let word = "";
        let index = 0;

        while(index < string.length) {
            let char = string[index++];

            if (char === " " || index >= string.length) {
                if (char !== " ") { word += char; }
                strings.push(word);
                word = "";
                continue; 
            }

            word += char;

            if (char === "\"") {
                word = "";
                char = string[index++];
                while(char !== "\"" && string.length > index) {
                    word += char;
                    char = string[index++];
                }
                strings.push(word);
                continue;
            }
        }

        return strings;
    }
}

module.exports = { init }