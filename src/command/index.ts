import { DiscordAPIError, Message } from "discord.js";
import { readdirSync } from "fs";
import debug from "debug";
import { Command, CommandExecutor, CommandInfo } from "../types/commands";
import { get } from "../config";

const log = debug("bot:commands");

const commandsFolder = `${__dirname}`;
const executors: Map<string, CommandExecutor> = new Map();
const aliases: Map<string, string> = new Map();
const commandsInfo: Map<string, CommandInfo> = new Map();
importCommands();

export const parseMessage = (message: Message): [boolean, Command?] => {
	if (!message.content.startsWith(get("prefix"))) {
		return [false, null];
	}
	// TODO: use "" per stringhe in un comando
	const args = message.content.split(" ");
	const ctext = args[0].replace(get("prefix"), "").trim();

	if (!executors.has(ctext) && !aliases.has(ctext)) {
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
		const executor = executors.get(command.command) ?? executors.get(aliases.get(command.command));
		if (executor) await executor.run(command);
		await command.message.react(get("success"));
	} catch (e) {
		log(e);
		if ((e as DiscordAPIError).code !== 10008) {
			await command.message.react(get("error"));
		}
	}
};

export const commandsInformation = (
	command: string = null
): CommandInfo | IterableIterator<CommandInfo> => {
	return command ? commandsInfo.get(command) ?? commandsInfo.get(aliases.get(command)) : commandsInfo.values();
};

function importCommands() {
	const executorsFiles = readdirSync(commandsFolder).filter(
		(value) => value.endsWith(".js") && value !== "index.js"
	);
	for (let file of executorsFiles) {
		try {
			const executor = require(`${commandsFolder}/${file}`) as CommandExecutor;
			const cInfo = executor.info();
			const cName = cInfo.name;

			if (executors.has(cName)) {
				log("[WARNING] Overriding already existing executor id.");
			}

			executors.set(cName, executor);
			commandsInfo.set(cName, cInfo);

			for (let alias of executor.alias()) {
				aliases.set(alias, cName);
			}
		} catch (e) {}
	}
}
