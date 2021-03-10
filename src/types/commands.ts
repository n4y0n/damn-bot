import { Message } from "discord.js";

export interface Command {
	command: string;
	text: string;
	message: Message;
	arguments?: string[];
}

export interface CommandInfo {
	name: string;
	description: string;
	subcommands?: Array<CommandInfo>
	arguments?: string[]
}

export interface CommandExecutor {
	alias: () => Array<string>;
	run: (command: Command) => void;
	info: () => CommandInfo;
}
