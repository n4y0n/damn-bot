import {
	Client,
	IntentsBitField,
	Interaction,
	Message,
	Routes,
	SlashCommandBuilder,
} from "discord.js";

import debug from "debug";
import { config } from "dotenv";
import { get, load, setClient, Utils } from "./config";
import { REST } from '@discordjs/rest';

const log = debug("bot:bot");
// Load environments from .env
config();
// Load bot configurations from $HOME/.discord-bot.json
load().then(main);


async function main() {
	const commands = []
	const client = new Client({
		intents: [
			IntentsBitField.Flags.Guilds,
			IntentsBitField.Flags.GuildMessages,
			IntentsBitField.Flags.GuildMembers,
			IntentsBitField.Flags.GuildEmojisAndStickers,
			IntentsBitField.Flags.GuildScheduledEvents,
		],
	});
	const rest = new REST({ version: '10' }).setToken(get("token"));
	setClient(client);


	const clear = new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Clears messages')
		.setDMPermission(false);

	const ping = new SlashCommandBuilder()
		.setName('ping')
		.setDMPermission(false)
		.setDescription('Replies with Pong!');

	commands.push(clear, ping);

	client.on('interactionCreate', async (interaction: Interaction) => {
		console.log(interaction);

		if (!interaction.isChatInputCommand()) return;
		if (interaction.commandName === 'ping') {
			const int = await interaction.reply({
				content: 'Pinging...',
				ephemeral: true,
			});
			await interaction.editReply({
				content: `Pong! Latency is ${(await int.awaitMessageComponent()).createdTimestamp - interaction.createdTimestamp}ms. API Latency is ${Math.round(client.ws.ping)}ms`
			});
		}
	});

	client.on("ready", async () => {
		const status = get("status");
		const game = get("game");

		await rest.put(
			Routes.applicationCommands(client.user.id),
			{ body: commands },
		);

		client.user.setActivity(game);
		client.user.setStatus(status);
		const inviteUrl = client.generateInvite();
		log("[📡] Bot ready!");
		console.log("Use this url to make me join your server: %s", inviteUrl);
	});

	client.login(get("token"));
}

async function clear(message: Message, args: string[]) {
	const num = parseInt(args[0]);
	if (isNaN(num)) {
		await message.channel.send("Please provide a number of messages to delete");
		return;
	}

	if (num < 1 || num > 100) {
		await message.channel.send("Please provide a number between 1 and 100");
		return;
	}

	// const messages = await fetchMessages({ message, arguments: { num } });
	// await deleteMessages({ message, arguments: { num } }, messages);
}