import {
	fetchMaterialeAlgoritmi,
	fetchMaterialeBasiDati,
	fetchMaterialeReti,
	fetchMaterialeSistemiOperativi,
} from "../controller/universita";
import { Command, CommandInfo } from "../types/commands";

export const alias = (): Array<string> => {
	return ["g"];
};

export const run = async (command: Command) => {
	switch (command.subcommand.command) {
		case "mat":
			return subCommandGet(command.subcommand);
		default:
			return command.reply(
				"`" +
					command.arguments.subcommand +
					"` is not a valid subcommand."
			);
	}
};

export const info = () => {
	return {
		name: "get",
		description: "Provides pdf slides.",
		subcommands: [
			{
				name: "mat",
				description: "Materiali publicati dal professore/ssa.",
				arguments: ["reti", "so2", "bd2", "algo2"],
			},
		],
	} as CommandInfo;
};

async function subCommandGet(command: Command) {
	switch (command.arguments.mat) {
		case "reti":
			return command.reply(await fetchMaterialeReti());
		case "so2":
			return command.reply(await fetchMaterialeSistemiOperativi());
		case "bd2":
			return command.reply(await fetchMaterialeBasiDati());
		case "algo2":
			return command.reply(await fetchMaterialeAlgoritmi());
	}
}
