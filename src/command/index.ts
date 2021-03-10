import { Message } from "discord.js";
import { readdirSync } from "fs";
import debug from "debug";
import { Command, CommandExecutor } from "../types/commands";
import { get } from "../config";

const log = debug("bot:commands");

const commandsFolder = `${__dirname}`;
const map: Map<string, CommandExecutor> = new Map();
importCommands();

export const parseMessage = (message: Message): [boolean, Command?] => {
	if (!message.content.startsWith(get("prefix"))) {
		return [false, null];
	}

	const args = message.content.split(" ");
	const ctext = args[0].replace(get("prefix"), "").trim();

	if (!map.has(ctext)) {
		return [false, null];
	}

	const command = {
		command: ctext,
		arguments: args.slice(1),
		message: message,
		text: message.content,
	} as Command;

	return [true, command];
};

export const runCommand = (command: Command) => {
	const executor = map.get(command.command);
	if (executor) executor.run(command);
}

function importCommands() {
	const commandsFiles = readdirSync(commandsFolder).filter(
		(value) => value.endsWith(".js") && value !== "index.js"
	);
	for (let file of commandsFiles) {
		try {
			const command = require(`${commandsFolder}/${file}`);
			for (let id of command.ids()) {
				if (map.has(id)) log("[WARNING] Overriding already existing command id.");
				map.set(id, command);
			}
		} catch (e) {}
	}
}
