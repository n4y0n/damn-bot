import { commandHandler } from "./commands/commands";
import { Client } from "discord.js";
import { config as DotEnvInit } from "dotenv";
import { config, set } from "./config";

DotEnvInit();
config();

const client = new Client();
set("client", client);

client.on("message", commandHandler)

client.on("ready", () => console.log("[📡] Bot ready!"))

client.login(process.env.TOKEN);