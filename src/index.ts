import { commandHandler } from "./commands/commands";
import { Channel, Client } from "discord.js";
import { config as DotEnvInit } from "dotenv";
import { config, get, MagicNames, set } from "./config";

DotEnvInit();
config();

const client = new Client();
set(MagicNames.CLIENT, client);

client.on("message", commandHandler);

client.on("ready", () => {
    client.user.setActivity("\"@" + client.user.username + " info\" for more help.");

    // initialize guilds config map
    client.guilds.forEach(guild => !get(guild.id) ? set(guild.id, new Map()) : null);
    
    console.log("[📡] Bot ready!");
});

client.on("error", async e => {
    console.log("[📡] Error, riconnecting...");
    return client.login(process.env.TOKEN);
});

client.on("disconnect", (channel: Channel) => {
    console.log("[📡] Disconnected from " + channel.id);
});

client.login(process.env.TOKEN);