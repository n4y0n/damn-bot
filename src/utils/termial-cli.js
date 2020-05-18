//@ts-check
const readline = require("readline");
const { Client } = require("discord.js");
const log = require("./logging").getLogger("CliManager");

/**
 * @param {Client} bot
 */
async function init (bot) {

    const commands = new Map();

    commands.set("say", async function (_, to, message, autodelete, autodeleteTime = 30000) {
        if (!to || !message) throw Error();
        let receiver = null;
        if (/w*\/w*/gi.test(to)) {
            let data = to.split("/");
            const [guild] = await bot.guilds.array().filter(g => g.name === data[0]);
            if (!guild) return log.i("Guild " + data[0] + " not found!");
            
            receiver = await guild.channels.array().filter(c => c.name === data[1]).pop();
            if (!receiver) return log.i("Channel " + data[1] + " not found!");
        } else {
            
        }
        const msg = await receiver.send(message);
        if (autodelete) setTimeout(async () => await msg.delete(), autodeleteTime);
    });

    commands.set("hw", async function (bot, ...args) {
        if (args.length <= 0) throw Error();
        log.d(args.join(" ") + " world");
    });

    commands.set("help", async function (bot) {
        log.i("say <to> <message>");
        log.i("hw <message>");
        log.i("help");
    });

    const interface = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        completer: completeCommand
    });

    interface.on("line", async line => {
        if (!line) { return; }
        const execute = parseCommand(line);
        try { await execute(bot); } catch(e) { await parseCommand("help")(bot); }// finally { log.d("✨"); }
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

    function completeCommand(line, cb) {
        let matchs = []
        for (let [command, _] of commands.entries()) {
            if (strcmp(command, line, line.length) != 0) { continue; }

            matchs.push(command)
        }

        return cb(null, [matchs, line])
    }
}

module.exports = { init }