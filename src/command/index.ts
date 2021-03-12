import { DiscordAPIError, Message } from "discord.js";
import { readdirSync } from "fs";
import { Command, CommandExecutor, CommandInfo } from "../types/commands";
import debug from "debug";
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

	const [comm, args, subc] = parseArguments(message);

	if (!comm) {
		return [false, null];
	}

	const command = {
		command: comm,
		arguments: args,
		message: message,
		text: message.content,
		reply: message.channel.send.bind(message.channel),
		subcommand: subc,
	} as Command;

	return [true, command];
};

export const runCommand = async (command: Command) => {
	try {
		const executor =
			executors.get(command.command) ??
			executors.get(aliases.get(command.command));
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
	return command
		? commandsInfo.get(command) ?? commandsInfo.get(aliases.get(command))
		: commandsInfo.values();
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

function parseArguments(message: Message):
[string, { [name: string]: any }, Command]
{
	const splitted = message.content.split(" ");
	const commandString = splitted[0]?.replace(get("prefix"), "").trim();
	const _arguments = splitted.slice(1);
	if (!executors.has(commandString) && !aliases.has(commandString)) {
		return [null, null, null];
	}
	const info = commandsInformation(commandString) as CommandInfo;
	const args = argsFromInfo(_arguments, info);

	let subcommand: Command;
	if (_arguments.length > 0) {
		if (info.subcommands?.length > 0) {
			const sName = _arguments[0];
			if (sName) {
				const sInfo = info.subcommands.find((sc) => sc.name === sName);
				subcommand = parseSubcommand(message, _arguments, sInfo);
			}
		}
	}

	return [commandString, args, subcommand];
}

function argsFromInfo(
	splitted_message: string[],
	info: CommandInfo
): { [name: string]: any } {
	const args = {};

	if (info.arguments?.length > 0) {
		const keys = info.arguments as Array<string>;
		for (let key of keys) {
			const val = splitted_message.shift();
			if (val) args[key] = val;
		}
	} else if (info.arguments instanceof Object) {
		const keys = Object.keys(info.arguments);
		for (let key of keys) {
			const val = splitted_message.shift();
			if (val) args[key] = val;
			else args[key] = info.arguments[key].def;
		}
	}

	return args;
}

function parseSubcommand(message: Message, tokens: string[], cInfo: CommandInfo): Command {
	const command = tokens[0];
	const _arguments = tokens.slice(1);
	const args = argsFromInfo(_arguments, cInfo);

	let subcommand: Command;
	if (_arguments.length > 0) {
		if (cInfo.subcommands?.length > 0) {
			const sName = _arguments[0];
			if (sName) {
				const sInfo = cInfo.subcommands.find((sc) => sc.name === sName);
				subcommand = parseSubcommand(message, _arguments, sInfo);
			}
		}
	}

	return {
		command: command,
		message: message,
		text: tokens.join(" "),
		arguments: args,
		subcommand: subcommand,
		reply: message.channel.send.bind(message),
	} as Command;
}
