import { Attachment, Message, MessageOptions, RichEmbed, StringResolvable } from "discord.js";

export interface Command {
	command: string;
	text: string;
	message: Message;
	arguments?: { [name: string]: any };

	reply(content?: StringResolvable, options?: MessageOptions & { split: false } | RichEmbed | Attachment): Promise<Message>;
	reply(content?: StringResolvable, options?: MessageOptions | RichEmbed | Attachment): Promise<Message | Message[]>;
	reply(options?: MessageOptions | RichEmbed | Attachment): Promise<Message | Message[]>;
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
	run: (command: Command) => Promise<void>;
	info: () => CommandInfo;
}
