import { Channel, Client } from "discord.js";
import { config as DotEnvInit } from "dotenv";
import { load } from "./config";
import { config as gconfig } from "./guild";

DotEnvInit();
load().then(init);

function init() {
	const client = new Client();

	client.on("message", () => {});

	client.on("ready", () => {
		gconfig(client);

		client.user.setActivity(
			'"@' + client.user.username + ' info" for more help.'
		);

		console.log("[📡] Bot ready!");
	});

	client.on("error", async (e) => {
		console.log("[📡] Error, riconnecting...");
		return client.login(process.env.TOKEN);
	});

	client.on("disconnect", (channel: Channel) => {
		console.log("[📡] Disconnected from " + channel.id);
	});

	client.login(process.env.TOKEN);
}
