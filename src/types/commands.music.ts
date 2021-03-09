import { TextChannel, VoiceChannel, VoiceConnection } from "discord.js";

export interface Song {
	title: string;
	url: string;
}

export interface QueueContruct {
	textChannel: TextChannel;
	voiceChannel: VoiceChannel;
	connection: VoiceConnection;
	volume: number;
	playing: boolean;
	songs: Array<Song>;
}
