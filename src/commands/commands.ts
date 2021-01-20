import { Message } from "discord.js";
import { get } from "../config";

export async function commandHandler(message: Message) {
	if (message.author.bot) return;

	if (message.isMentioned(message.client.user)) {
		console.log("[🛰️] mentioned by " + message.author.username + ".");
		await message.react("✨");
	}

	if (
		(get("prefix") && message.content.startsWith(get("prefix"))) ||
		message.isMentioned(message.client.user)
	) {
		removeActivation(message);
		if (!message.content) return;
		await dispatchMessage(message);
	}
}

function removeActivation(message: Message) {
	if (message.isMentioned(message.client.user)) {
		message.content = message.content
			.replace("<@!" + message.client.user.id + ">", "")
			.trim();
	}
	if (get("prefix") && message.content.startsWith(get("prefix"))) {
		message.content = message.content.replace(get("prefix"), "").trim();
	}
}

async function dispatchMessage(message: Message) {}
