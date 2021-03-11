import { RichEmbed } from "discord.js";
import { commandsInformation } from ".";
import { get } from "../config";
import { Command, CommandInfo } from "../types/commands";

export const alias = (): Array<string> => {
	return ["h"];
};

export const run = async (command: Command) => {
	const embed = new RichEmbed();
	embed.setColor("DARK_PURPLE");
	embed.setTitle("---HELP---");
	const argsstr = command.arguments instanceof Array ? command.arguments : Object.keys(command.arguments);

	if (argsstr.length > 0) {
		genEmbed(
			embed,
			commandsInformation(argsstr.shift()) as CommandInfo,
			argsstr
		);
	} else {
		for (let info of commandsInformation() as IterableIterator<CommandInfo>) {
			embed.addField(
				buildCommandHelpString(info),
				info.description || "lorem ipsum"
			);
		}
	}
	await command.reply(embed);
};

export const info = () => {
	return {
		name: "help",
		description: "Provides help."
	} as CommandInfo;
};

function genEmbed(embed: RichEmbed, com: CommandInfo, args: string[]) {
	if (args.length === 0) {
		embed.setTitle(`HELP ${com.name}`);
		embed.addField(com.name, com.description || "lorem ipsum");
		embed.addBlankField();
		for (let info of com.subcommands ?? []) {
			embed.addField(
				`${get("prefix")}${com.name} ${buildCommandHelpString(info)}`,
				info.description || "lorem ipsum"
			);
		}
	} else {
		let sc = args.shift();
		genEmbed(embed, com.subcommands.find(v => v.name === sc), args);
	}
}

function buildCommandHelpString(info: CommandInfo) {
	let subcommandsPresent: string;

	if (info.subcommands) {
		subcommandsPresent = "";
	}

	const sca = info.subcommands ?? [];
	for (let s = 0; s < sca.length; s++) {
		const sc = sca[s];
		subcommandsPresent += sc.name;
		if (s < sca.length - 1) {
			subcommandsPresent += " | ";
		}
	}

	let argumentsPresent: string;

	if (info.arguments) {
		argumentsPresent = "<";
	}

	const aa = toArray(info.arguments);
	for (let s = 0; s < aa.length; s++) {
		const a = aa[s];
		argumentsPresent += a;
		if (s < aa.length - 1) {
			argumentsPresent += " | ";
		}
	}
	if (info.arguments) {
		argumentsPresent += ">";
	}

	const argstr = `${argumentsPresent ?? subcommandsPresent ?? ""}`;

	return `${info.name} ${argstr}`;
}

function toArray(obj: {} | [] | undefined) {
	if (!obj) return [];
	if (obj instanceof Array) {
		return obj
	} else {
		return Object.keys(obj);
	}
}
