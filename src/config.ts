import { Guild } from "discord.js";
import { homedir } from "os";
import { join } from "path";

import { readFileSync, writeFileSync } from "fs";

const configPath = join(homedir(), ".discord-bot.conf");

interface Serializable {
	serialize(): string;
}

class GuildConfig {}

class Config implements Serializable {
	private config: Map<string, GuildConfig> = new Map();

	serialize(): string {
		return JSON.stringify(this.config);
	}
}

function deserializeConfig() {
	try {
		return JSON.parse(readFileSync(configPath, { encoding: "utf-8" }));
	} catch (e) {
		return {};
	}
}

function serializeConfig(config: Serializable) {
	writeFileSync(configPath, config.serialize(), { encoding: "utf-8" });
}

export function setupGuildConfig(guild: Guild) {}

export async function load() {

}
