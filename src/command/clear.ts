import { Command, CommandInfo } from "../types/commands";
import { fetchMessages, deleteMessages } from "../controller/clear";

export const alias = (): Array<string> => {
	return ["cls"];
};

export const run = async (command: Command) => {
	const messages = await fetchMessages(command);
	await deleteMessages(command, messages);
};

export const info = () => {
	return {
		name: "clear",
		description: "",
		arguments: { num: { def: 2 } },
	} as CommandInfo;
};
