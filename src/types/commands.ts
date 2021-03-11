import { Message } from "discord.js";

export interface Command {
	command: string;
	text: string;
	message: Message;
	arguments?: { [name: string]: any };
}

export interface Arguments {
	[name: string]: Argument;
}

export interface Argument {
	def?: any;
	verify?: (value: string) => boolean;
}

export interface CommandInfo {
	name: string;
	description: string;
	subcommands?: Array<CommandInfo>;
	arguments?: Arguments | Array<string>;
}

export interface CommandExecutor {
	alias: () => Array<string>;
	run: (command: Command) => void;
	info: () => CommandInfo;
}
