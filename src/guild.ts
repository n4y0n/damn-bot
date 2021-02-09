import { Client } from "discord.js";
import { get, set } from "./globalConfigs";

export function config(client: Client) {
	// initialize guilds config map
	client.guilds.forEach((guild) =>
		!get(guild.id) ? set(guild.id, {}) : null
	);
}
