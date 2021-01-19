import { commandHandler } from "./commands/commands";
import { Client } from "discord.js";
import { config as DotEnvInit } from 'dotenv';

DotEnvInit()

const client = new Client();

client.on("message", commandHandler)

client.on("ready", () => console.log("📡 Bot ready!"))

client.login(process.env.TOKEN);