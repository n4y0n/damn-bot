import { Guild } from "discord.js";
import { homedir } from "os";
import { join } from "path";
import debug from "debug";

const log = debug("bot:config");

import { existsSync, readFileSync, writeFileSync } from "fs";

const configPath = join(homedir(), ".discord-bot.conf");

let configs = {};
let guilds = {};

const deserializeConfig = () => {
	if (!existsSync(configPath)) return;
	log("Configuration file has been found.")
	log("Deserializing from configuration file.")

	const { guildsConfig, botConfigs } = JSON.parse(
		readFileSync(configPath, { encoding: "utf-8" })
	);

	configs = botConfigs;
	guilds = guildsConfig;
	log("Deserialization done.")
};

const serializeConfig = () => {
	log("Serializing configurations to file.")
	const guildsConfig = guilds;
	const botConfigs = configs;

	const data = {
		guildsConfig,
		botConfigs,
	};

	writeFileSync(configPath, JSON.stringify(data), { encoding: "utf-8" });
	log("Serialization done.")
};

export const getGuild = (guild: Guild) => {
	if (!guilds[guild.id]) {
		guilds[guild.id] = {};
	}
	return guilds[guild.id];
};

export const get = (key: string) => {
	if (!configs[key]) {
		return null;
	}
	return configs[key];
}

export const setupGuildConfig = (guild: Guild) => {
	if (!guilds[guild.id]) guilds[guild.id] = {};
};

export const load = () => deserializeConfig();

export const save = () => serializeConfig();
