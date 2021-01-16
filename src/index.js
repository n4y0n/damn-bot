require('dotenv').config();

const { commandHandler } = require("./commands/commands");

const Discord = require("discord.js");
const client = new Discord.Client();

client.on("message", commandHandler)

client.on("ready", () => console.log("📡 Bot ready!"))

client.login(process.env.TOKEN);