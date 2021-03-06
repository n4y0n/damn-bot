import {
	Message,
	TextChannel,
	VoiceChannel,
	VoiceConnection,
} from "discord.js";
import * as ytdl from "ytdl-core";

const queue = new Map<string, QueueContruct>();

class Song {
	constructor(public title: string, public url: string) {}
}

class QueueContruct {
	public textChannel: TextChannel;
	public voiceChannel: VoiceChannel;
	public connection: VoiceConnection;

	public volume: number = 5;
	public playing: boolean = true;

	private m_songs: Array<Song> = [];

	constructor(
		tc: TextChannel | any,
		vc: VoiceChannel,
		con: VoiceConnection = null
	) {
		this.textChannel = tc;
		this.voiceChannel = vc;
		this.connection = con;
	}

	enqueue(song: Song) {
		this.m_songs.push(song);
	}

	first() {
		return this.m_songs[0];
	}

	shift() {
		this.m_songs.shift();
	}

	clear() {
		this.m_songs = [];
	}

	size() {
		return this.m_songs.length;
	}
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
	const song = new Song(
		songInfo.videoDetails.title,
		songInfo.videoDetails.video_url
	);

	const serverQueue: QueueContruct = queue.get(message.guild.id);

	if (!serverQueue) {
		// Creating the contract for our queue
		const queueContruct = new QueueContruct(message.channel, voiceChannel);
		// Setting the queue using our contract
		queue.set(message.guild.id, queueContruct);
		// Pushing the song to our songs array
		queueContruct.enqueue(song);

		try {
			// Here we try to join the voicechat and save our connection into our object.
			var connection = await voiceChannel.join();
			queueContruct.connection = connection;
			// Calling the play function to start a song
			startSong(message.guild, queueContruct.first());
		} catch (err) {
			// Printing the error message if the bot fails to join the voicechat
			queue.delete(message.guild.id);
			voiceChannel.leave();
		}
	} else {
		serverQueue.enqueue(song);
		return message.channel.send(
			`${song.title} has been added to the queue!`
		);
	}
}

function startSong(guild, song) {
	const serverQueue = queue.get(guild.id);
	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}

	const dispatcher = serverQueue.connection
		.playStream(ytdl(song.url))
		.on("end", () => {
			serverQueue.shift();
			startSong(guild, serverQueue.first());
		})
		.on("error", (error) => console.error(error));
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
	serverQueue.textChannel.send(`Start playing: **${song.title}**`);
}

export async function stop(message: Message) {
	const serverQueue = queue.get(message.guild.id);

	if (!message.member.voiceChannel)
		return message.channel.send(
			"You have to be in a voice channel to stop the music!"
		);

	if (!serverQueue)
		return message.channel.send("There is no song that I could stop!");

	serverQueue.clear();

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

	serverQueue.shift();
	if (serverQueue.size() > 0) startSong(message.guild, serverQueue.first());
	else serverQueue.voiceChannel.leave();
}
