import { Channel, Client } from "discord.js";
import { config } from "dotenv";
import { load } from "./config";

config();
load();

const client = new Client();

client.on("message", () => {});

client.on("ready", () => {
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
