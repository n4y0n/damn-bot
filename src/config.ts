import { Guild, PresenceStatus } from "discord.js";
import { homedir } from "os";
import { join } from "path";
import debug from "debug";

const log = debug("bot:config");

import { existsSync, readFileSync, writeFileSync } from "fs";
import { BotConfigKey, BotStatus } from "./types/config";

const configPath = join(homedir(), ".discord-bot.json");

let configs = {};
let guilds = {};

const generateDefaultConfigurations = () => {
	log("Configuration file not found. Generating one with default values.");
	const defaults = {
		owner: "315437752093245441",
		prefix: "-",
		game: "DEFAULT",

		// Valid values: ONLINE IDLE DND INVISIBLE
		status: "DND",
		altprefix: "@mention",
		// If you set these, it will change the various emojis
		success: "✨",
		warning: "💡",
		error: "🚫",
		loading: "⌚",
		searching: "🔎",

		// cmds to see the help text
		help: "help",

		// Note: If you set this to true, the nowplaying boxes will NOT refresh
		// This is because refreshing the boxes causes the image to be reloaded
		// every time it refreshes.
		npimages: false,

		// If you set this, the bot will not leave a voice channel after it finishes a queue.
		// Keep in mind that being connected to a voice channel uses additional bandwith,
		// so this option is not recommended if bandwidth is a concern.
		stayinchannel: false,
		aliases: {},
	};

	configs = defaults;
	serializeConfig();
};

const deserializeConfig = () => {
	if (!existsSync(configPath)) {
		generateDefaultConfigurations();
		return;
	}

	log("Configuration file has been found.");
	log("Deserializing from configuration file.");

	const { guildsConfig, botConfigs } = JSON.parse(
		readFileSync(configPath, { encoding: "utf-8" })
	);

	configs = botConfigs;
	guilds = guildsConfig;
	log("Deserialization done.");
};

const serializeConfig = () => {
	log("Serializing configurations to file.");
	const guildsConfig = guilds;
	const botConfigs = configs;

	const data = {
		guildsConfig,
		botConfigs,
	};

	writeFileSync(configPath, JSON.stringify(data, null, 2), {
		encoding: "utf-8",
	});
	log("Serialization done.");
};

export const getGuild = (guild: Guild) => {
	if (!guilds[guild.id]) {
		guilds[guild.id] = {};
	}
	return guilds[guild.id];
};

export const get = (key: BotConfigKey) => {
	if (configs[key] === undefined) {
		return null;
	}
	const value = configs[key];
	return getDefaultOrValue(key, value);
};

export const load = () => deserializeConfig();

export const save = () => serializeConfig();

function getDefaultOrValue(key: BotConfigKey, value: any) {
	switch(key) {
		case "game":
			return value === "DEFAULT" ? `Type ${get("prefix")} ${get("help")}.` : value;
		case "prefix":
			return value ? value : get("altprefix");
		case "status":
			return value.toLowerCase();
		default:
			return value;
	}
}
