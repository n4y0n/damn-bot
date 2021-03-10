import { play, skip, stop } from "../controller/ytmusic";
import { Command } from "../types/commands";

export const ids = (): Array<string> => {
	return ["play", "skip", "stop"];
};

export const run = async (command: Command) => {
	switch (command.command) {
		case "play":
			return play(command.message);
		case "skip":
			return skip(command.message);
		case "stop":
			return stop(command.message);
	}
};
