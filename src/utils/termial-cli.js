//@ts-check
const readline = require("readline")
const log = require("./logging").getLogger("CliManager")

async function init (bot) {

    const commands = new Map();

    commands.set("say", async function (bot, to, message) {
        if (!to || !message) throw Error();
        // const channel = await bot.channels.get('538747728763682817'); //'670943087807299607'//
        // const message = await channel.send("test boi.");
        // await message.react("🙂");
        // setTimeout(async () => await message.delete(), 3000);
    });

    commands.set("hw", async function (bot, ...args) {
        if (args.length <= 0) throw Error();
        log.d(args.join(" ") + " world");
    });

    commands.set("help", async function (bot) {
        log.i("say <to> <message>");
        log.i("hw <message>");
    });

    const interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        completer: completeCommand
    });

    interface.on("line", async line => {
        if (!line) { return; }
        const execute = parseCommand(line);
        try { await execute(bot); } catch(e) { await parseCommand("help")(bot); } finally { log.d("✨"); }
    });

    function parseCommand(string) {
        const [command, ...args] = parseWords(string);
        return buildCommand(command, args);
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

    function strcmp (str1, str2, lgth) {
        var s1 = (str1 + '')
          .substr(0, lgth);
        var s2 = (str2 + '')
          .substr(0, lgth);
      
        return ((s1 == s2) ? 0 : ((s1 > s2) ? 1 : -1));
    }

    function completeCommand(line) {
        let matchs = []
        for (let [command, _] of commands.entries()) {
            if (strcmp(command, line, line.length) != 0) { continue; }

            matchs.push(command)
        }
        return [matchs, line]
    }
}

module.exports = { init }