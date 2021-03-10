import { Command, CommandInfo } from "../types/commands";

export const alias = (): Array<string> => {
	return ["cls"];
};

export const run = async (command: Command) => {
	const msgs = await (await command.message.channel.fetchMessages({ limit: 5 })).filter(m => m.id !== command.message.id);
	await command.message.channel.bulkDelete(msgs, true);
};

export const info = () => {
	return {
		name: "clear",
		description: "",
	} as CommandInfo;
};
