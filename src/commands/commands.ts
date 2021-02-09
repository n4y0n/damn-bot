import { Message, RichEmbed } from "discord.js";
import { get } from "../globalConfigs";
import { play, skip, stop } from "./ytmusic";

export async function onMessageHandler(message: Message) {
	if (message.author.bot) return;

	if (message.isMentioned(message.client.user)) {
		console.log("[🛰️] mentioned by " + message.author.username + ".");
		await message.react("✨");
	}

	if (
		(get("prefix") && message.content.startsWith(get("prefix"))) ||
		message.isMentioned(message.client.user)
	) {
		removePrefix(message);
		if (!message.content) return;
		await dispatchMessage(message);
	}
}

function removePrefix(message: Message) {
	if (message.isMentioned(message.client.user)) {
		message.content = message.content
			.replace("<@!" + message.client.user.id + ">", "")
			.trim();
	}
	if (get("prefix") && message.content.startsWith(get("prefix"))) {
		message.content = message.content.replace(get("prefix"), "").trim();
	}
}

async function dispatchMessage(message: Message) {
	if (message.content.startsWith("play")) {
		await play(message);
	}

	if (message.content.startsWith("skip")) {
		await skip(message);
	}

	if (message.content === "stop") {
		await stop(message);
	}

	if (message.content === "info") {
		const embed = new RichEmbed();
		embed.setTitle("Seylum's Dependencies");
		buildDeps(embed);
		embed.setFooter("powered by node " + process.version);
		embed.setThumbnail(message.client.user.avatarURL);
		await message.channel.send(embed);
	}
}

function buildDeps(embed: RichEmbed) {
	try {
		const { dependencies } = require("../../package.json");
		for (const [key, val] of Object.entries(dependencies)) {
			embed.addField(key, "v" + val);
		}
	} catch (err) {
		console.log(err);
	}
}
