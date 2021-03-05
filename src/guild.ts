import { Client } from "discord.js";
import { setupGuildConfig } from "./config";

export function config(client: Client) {
	// initialize guilds config map
	client.guilds.forEach(guild => setupGuildConfig(guild));
}
