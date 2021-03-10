import { Message } from "discord.js";
import { readdirSync } from "fs";
import debug from "debug";
import { Command, CommandExecutor, CommandInfo } from "../types/commands";
import { get } from "../config";

const log = debug("bot:commands");

const commandsFolder = `${__dirname}`;
const map: Map<string, CommandExecutor> = new Map();
const commandsInfo: Array<CommandInfo> = [];
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

export const runCommand = async (command: Command) => {
	try {
		const executor = map.get(command.command);
		if (executor) await executor.run(command);
		await command.message.react(get("success"));
	} catch (e) {
		log(e);
		await command.message.react(get("error"));
	}
};

export const commandsInformation = () => commandsInfo;

function importCommands() {
	const executorsFiles = readdirSync(commandsFolder).filter(
		(value) => value.endsWith(".js") && value !== "index.js"
	);
	for (let file of executorsFiles) {
		try {
			const executor = require(`${commandsFolder}/${file}`);
			for (let id of executor.ids()) {
				if (map.has(id))
					log("[WARNING] Overriding already existing executor id.");
				map.set(id, executor);
				commandsInfo.push(executor.info());
			}
		} catch (e) {}
	}
}
