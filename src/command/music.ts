import { play, skip, stop } from "../controller/ytmusic";
import { Command, CommandInfo } from "../types/commands";

export const alias = (): Array<string> => {
	return ["m", "ytm"];
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
		subcommands: [
			{
				name: "play",
				description:
					"Start background play of the provided youtube url.",
				arguments: ["url"],
			},
			{
				name: "skip",
				description: "Skip currently playing url.",
			},
			{
				name: "stop",
				description:
					"Stop all song, clear the playlist and disconnect.",
			},
		],
	} as CommandInfo;
};
