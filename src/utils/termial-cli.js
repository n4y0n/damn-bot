//@ts-check
const readline = require("readline")
const log = require("./logging").getLogger("CliManager")

async function init (bot) {
    const channelsCache = new Map();
    
    const interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    interface.on("line", async line => {
        const execute = parseCommand(line);
        await execute(bot);
    });

    function parseCommand(string) {
        const args = parseWords(string);

        log.i(args)

        return async bot => {
            // const channel = await bot.channels.get('538747728763682817'); //'670943087807299607'//
            // const message = await channel.send("test boi.");
            // await message.react("🙂");
            // setTimeout(async () => await message.delete(), 3000);
        }
    }

    function parseWords(string) {
        let strings = [];
        let word = "";
        let index = 0;

        while(index < string.length) {
            let char = string[index++];
            word += char;

            if (char === " " || index >= string.length) {
                strings.push(word);
                word = "";
                continue; 
            }

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