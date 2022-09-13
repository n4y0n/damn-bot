import { Channel, Client, Message, Permissions } from "discord.js";
import debug from "debug";
import { config } from "dotenv";
import { get, load, setClient, Utils } from "./config";
import { handleMessage } from "./controller/handler";
import checkproc from "./controller/checkproc";

const log = debug("bot:bot");

// Load environments from .env
config();

// Load bot configurations from $HOME/.discord-bot.json
load().then(main);

function main() {
	const client = new Client();
	setClient(client);

	client.on("message", (message: Message) => {
		log("[📡] Message received");
		logMessage(message);

		if (!isForMe(message)) return;
		sanitizeMessage(message);
		handleMessage(message);
	});

	client.on("ready", async () => {
		const status = get("status");
		const game = get("game");

		await checkproc(client);

		await client.user.setActivity(game);
		await client.user.setStatus(status);
		const inviteUrl = await client.generateInvite(Permissions.ALL);
		console.log("Use this url to make me join your server: %s", inviteUrl);
		log("[📡] Bot ready!");
	});

	client.on("error", (e) => {
		log("[ERROR] %o", e);
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
		message.content = Utils.removeMention(message.content, message.client.user.id);
	}
}

function isForMe(message: Message) {
	if (message.author.bot) return false;

	if (message.content.startsWith(get("prefix"))) {
		return true;
	}

	if (get("prefix") === "@mention" || get("altprefix") === "@mention") {
		return message.isMentioned(message.client.user)
	}
	return false;
}
