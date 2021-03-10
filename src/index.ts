import { Channel, Client, Message, Permissions, TextChannel } from "discord.js";
import debug from "debug";
import { config } from "dotenv";
import { get, load, setClient } from "./config";
import { parseMessage, runCommand } from "./command";

const log = debug("bot:bot");

// Load environments from .env
config();

// Load bot configurations from $HOME/.discord-bot.json
load();

const client = new Client();
setClient(client);

client.on("message", (message: Message) => {
	const [isCommand, command] = parseMessage(message);
	if (isCommand) runCommand(command);
});

client.on("ready", async () => {
	const status = get("status");
	const game = get("game");

	await client.user.setActivity(game);
	await client.user.setStatus(status);

	const inviteUrl = await client.generateInvite(Permissions.ALL);

	console.log(inviteUrl);
	console.log("[📡] Bot ready!");
});

client.on("error", (e) => {
	console.error("[📡] %o", e);
});

client.on("disconnect", (channel: Channel) => {
	log("[📡] Disconnected from " + channel.id);
});

client.login(get("token"));
