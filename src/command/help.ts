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
	if (command.arguments.length > 0) {
		genEmbed(
			embed,
			commandsInformation(command.arguments.shift()) as CommandInfo
		);
	} else {
		for (let info of commandsInformation() as IterableIterator<CommandInfo>) {
			embed.addField(
				buildCommandHelpString(info),
				info.description || "lorem ipsum"
			);
		}
	}
	await command.message.channel.send(embed);
};

export const info = () => {
	return {
		name: "help",
		description: "Provides help.",
	} as CommandInfo;
};

function genEmbed(embed: RichEmbed, com: CommandInfo) {
	embed.setTitle(`HELP ${com.name}`);
	embed.addField(com.name, com.description)
	embed.addBlankField();
	for (let info of com.subcommands ?? []) {
		embed.addField(
			`${get("prefix")}${com.name} ${buildCommandHelpString(info)}`,
			info.description || "lorem ipsum"
		);
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

	const aa = info.arguments ?? [];
	for (let s = 0; s < aa.length; s++) {
		const a = aa[s];
		argumentsPresent += a;
		if (s < aa.length - 1) {
			argumentsPresent += " | ";
		}
	}
	if (info.arguments) {
		argumentsPresent = ">";
	}

	const argstr = `${(argumentsPresent ?? subcommandsPresent) ?? ""}`;

	return `${info.name} ${argstr}`;
}
