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
	arguments?: string[]
}

export interface CommandExecutor {
	ids: () => Array<string>;
	run: (command: Command) => void;
	info: () => CommandInfo;
}
