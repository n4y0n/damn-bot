import { RichEmbed } from "discord.js";
import { commandsInformation } from ".";
import { Command, CommandInfo } from "../types/commands";

export const ids = (): Array<string> => {
	return ["help"];
};

export const run = async (command: Command) => {
	const embed = new RichEmbed();
	embed.setTitle("---HELP---");
	for (let info of commandsInformation()) {
		const args = !!info.arguments;
		const argstr = ` [${info.arguments?.join(" | ")}]`;
		embed.addField(`${info.name}${args ? argstr : ""}`, info.description)
	}
	await command.message.channel.send(embed);
};

export const info = () => {
	return {
		name: "help",
		description: "Provides help."
	} as CommandInfo
}
