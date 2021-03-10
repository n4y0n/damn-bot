import {
	Message,
	TextChannel,
	VoiceChannel,
	VoiceConnection,
} from "discord.js";
import * as ytdl from "ytdl-core";
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

export async function play(message: Message) {
	const voiceChannel = message.member.voiceChannel;

	if (!voiceChannel)
		return message.channel.send(
			"You need to be in a voice channel to play music!"
		);

	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
		return message.channel.send(
			"I need the permissions to join and speak in your voice channel!"
		);
	}

	const songInfo = await ytdl.getInfo(message.content);
	const song: Song = new SimpleSongImpl(
		songInfo.videoDetails.title,
		songInfo.videoDetails.video_url
	);

	const serverQueue: QueueContruct = queue.get(message.guild.id);

	if (!serverQueue) {
		// Creating the contract for our queue
		const queueContruct = new SimpleQueueContructImpl(
			message.channel as TextChannel,
			voiceChannel
		);
		// Setting the queue using our contract
		queue.set(message.guild.id, queueContruct);
		// Pushing the song to our songs array
		queueContruct.songs.push(song);

		try {
			// Here we try to join the voicechat and save our connection into our object.
			var connection = await voiceChannel.join();
			queueContruct.connection = connection;
			// Calling the play function to start a song
			startSong(message.guild.id, queueContruct.songs[0]);
		} catch (err) {
			// Printing the error message if the bot fails to join the voicechat
			queue.delete(message.guild.id);
			voiceChannel.leave();
		}
	} else {
		serverQueue.songs.push(song);
		return message.channel.send(
			`${song.title} has been added to the queue!`
		);
	}
}

export async function stop(message: Message) {
	const serverQueue = queue.get(message.guild.id);

	if (!message.member.voiceChannel)
		return message.channel.send(
			"You have to be in a voice channel to stop the music!"
		);

	if (!serverQueue)
		return message.channel.send("There is no song that I could stop!");

	serverQueue.songs = [];

	if (serverQueue.connection.dispatcher)
		serverQueue.connection.dispatcher.end();

	serverQueue.voiceChannel.leave();
}

export async function skip(message: Message) {
	const serverQueue = queue.get(message.guild.id);

	if (!message.member.voiceChannel) {
		return message.channel.send(
			"You have to be in a voice channel to stop the music!"
		);
	}

	if (!serverQueue)
		return message.channel.send("There is no song that I could skip!");

	if (serverQueue.connection.dispatcher)
		serverQueue.connection.dispatcher.end();

	serverQueue.songs.shift();
	if (serverQueue.songs.length > 0)
		startSong(message.guild.id, serverQueue.songs[0]);
	else serverQueue.voiceChannel.leave();
}
