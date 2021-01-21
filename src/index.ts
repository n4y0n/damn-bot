import { commandHandler } from "./commands/commands";
import { Channel, Client } from "discord.js";
import { config as DotEnvInit } from "dotenv";
import { config, get, set } from "./config";

DotEnvInit();
config();

const client = new Client();
set("client", client);

client.on("message", commandHandler);

client.on("ready", () => {
    client.user.setActivity("prefix " + get("prefix"));
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
