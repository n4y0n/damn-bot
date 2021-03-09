import { Channel, Client } from "discord.js";
import debug from "debug";
import { config } from "dotenv";
import { get, load } from "./config";

const log = debug("bot:bot");

// Load environments from .env
config();

// Load bot configurations from $HOME/.discord-bot.json
load();

const client = new Client();

client.on("message", () => {});

client.on("ready", async () => {
	const status = get("status");
	const game = get("game");

	await client.user.setActivity(game);
	await client.user.setStatus(status);

	log("[📡] Bot ready!");
});

client.on("error", async (e) => {
	log("[📡] %o", e);
});

client.on("disconnect", (channel: Channel) => {
	log("[📡] Disconnected from " + channel.id);
});

client.login(process.env.TOKEN);
