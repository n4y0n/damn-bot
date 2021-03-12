import {
	Message,
	TextChannel,
	VoiceChannel,
	VoiceConnection,
} from "discord.js";
import * as ytdl from "ytdl-core";
import { Command } from "../types/commands";
import { QueueContruct, Song } from "../types/commands.music";

const queue = new Map<string, QueueContruct>();

class SimpleSongImpl implements Song {
	constructor(public title: string, public url: string) {}
}

class SimpleQueueContructImpl implements QueueContruct {
	public volume: number = 5;
	public playing: boolean = true;
	public songs: Array<Song> = [];

	constructor(
		public textChannel: TextChannel,
		public voiceChannel: VoiceChannel,
		public connection: VoiceConnection = null
	) {}
}

function startSong(guildID: string, song: Song) {
	const serverQueue: QueueContruct = queue.get(guildID);
	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guildID);
		return;
	}

	const dispatcher = serverQueue.connection
		.playStream(ytdl(song.url))
		.on("end", () => {
			serverQueue.songs.shift();
			startSong(guildID, serverQueue.songs[0]);
		})
		.on("error", (error) => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
	serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

export async function play(command: Command) {
	const voiceChannel = command.message.member.voiceChannel;
	const guildID = command.message.guild.id;

	if (!voiceChannel)
		return command.reply(
			"You need to be in a voice channel to play music!"
		);

	const permissions = voiceChannel.permissionsFor(
		command.message.client.user
	);
	if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
		return command.reply(
			"I need the permissions to join and speak in your voice channel!"
		);
	}

	const songInfo = await ytdl.getInfo(command.arguments.url);
	const song: Song = new SimpleSongImpl(
		songInfo.videoDetails.title,
		songInfo.videoDetails.video_url
	);

	const serverQueue: QueueContruct = queue.get(guildID);

	if (!serverQueue) {
		// Creating the contract for our queue
		const queueContruct = new SimpleQueueContructImpl(
			command.message.channel as TextChannel,
			voiceChannel
		);
		// Setting the queue using our contract
		queue.set(guildID, queueContruct);
		// Pushing the song to our songs array
		queueContruct.songs.push(song);

		try {
			// Here we try to join the voicechat and save our connection into our object.
			var connection = await voiceChannel.join();
			queueContruct.connection = connection;
			// Calling the play function to start a song
			startSong(guildID, queueContruct.songs[0]);
		} catch (err) {
			// Printing the error message if the bot fails to join the voicechat
			queue.delete(guildID);
			voiceChannel.leave();
		}
	} else {
		serverQueue.songs.push(song);
		return command.reply(
			`${song.title} has been added to the queue!`
		);
	}
}

export async function stop(command: Command) {
	const serverQueue = queue.get(command.message.guild.id);

	if (!command.message.member.voiceChannel)
		return command.reply(
			"You have to be in a voice channel to stop the music!"
		);

	if (!serverQueue)
		return command.reply("There is no song that I could stop!");

	serverQueue.songs = [];

	if (serverQueue.connection.dispatcher)
		serverQueue.connection.dispatcher.end();

	serverQueue.voiceChannel.leave();
}

export async function skip(command: Command) {
	const guildID = command.message.guild.id;
	const serverQueue = queue.get(guildID);

	if (!command.message.member.voiceChannel) {
		return command.reply(
			"You have to be in a voice channel to stop the music!"
		);
	}

	if (!serverQueue)
		return command.reply("There is no song that I could skip!");

	if (serverQueue.connection.dispatcher)
		serverQueue.connection.dispatcher.end();

	serverQueue.songs.shift();
	if (serverQueue.songs.length > 0)
		startSong(guildID, serverQueue.songs[0]);
	else serverQueue.voiceChannel.leave();
}
