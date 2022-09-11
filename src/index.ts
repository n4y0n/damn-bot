import { Channel, Client, Message, Permissions, TextChannel } from "discord.js";
import debug from "debug";
import { config } from "dotenv";
import { get, load, setClient } from "./config";

const log = debug("bot:bot");

// Load environments from .env
config();

// Load bot configurations from $HOME/.discord-bot.json
load().then(main);

function main() {
	const client = new Client();
	setClient(client);

	client.on("message", (message: Message) => {
		if (!isForMe(message)) return;
		sanitizeMessage(message);


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
}

function sanitizeMessage(message: Message) {
	if(message.content.startsWith(get("prefix"))) {
		message.content = message.content.substr(get("prefix").length);
		return;
	}
	if (message.isMentioned(message.client.user)) {
		// <@!716280540147482624>
		message.content = message.content.replace(`<!${message.client.user.id}>`, "")
	}
}

function isForMe(message: Message) {
	if (message.content.startsWith(get("prefix"))) {
		return true;
	}
	if (get("prefix") === "@mention" || get("altprefix") === "@mention") {
		return message.isMentioned(message.client.user)
	}
	return false;
}

