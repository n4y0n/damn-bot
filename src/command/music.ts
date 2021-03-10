import { Command } from "../types/commands";

export const ids = (): Array<string> => {
	return ["play", "skip", "stop"]
};

export const run = (command: Command) => {
	console.log(command.command);
};
