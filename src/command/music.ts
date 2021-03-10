import { play, skip, stop } from "../controller/ytmusic";
import { Command, CommandInfo } from "../types/commands";

export const ids = (): Array<string> => {
	return ["music"];
};

export const run = async (command: Command) => {
	switch (command.arguments?.[0]) {
		case "play":
			return play(command.message);
		case "skip":
			return skip(command.message);
		case "stop":
			return stop(command.message);
	}
};

export const info = () => {
	return {
		name: "music",
		description: "Music related commands.",
		arguments: ["play", "skip", "stop"]
	} as CommandInfo
}
