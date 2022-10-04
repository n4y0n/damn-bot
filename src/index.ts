import {
	Channel,
	Client,
	Collection,
	GatewayIntentBits,
	Interaction,
	Message,
	OAuth2Scopes,
	Routes,
	SlashCommandBuilder,
	TextChannel,
} from "discord.js";

import debug from "debug";
import { get, load, setClient, Util } from "./config";
import { REST } from '@discordjs/rest';

const log = debug("bot:bot");
// Load bot configurations from $HOME/.discord-bot.json
load().then(main);


async function main() {
	const commands = []
	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildScheduledEvents,
		],
	});
	const rest = new REST({ version: '10' }).setToken(get("token"));
	setClient(client);


	const clear = new SlashCommandBuilder()
		.setName('clear')
		.setDescription('Clears messages')
		.addNumberOption(option =>
			option.setName('number')
				.setDescription('The number of messages to clear')
				.setRequired(true)
		)
		.setDMPermission(false);

	const ping = new SlashCommandBuilder()
		.setName('ping')
		.setDMPermission(false)
		.setDescription('Replies with Pong!');

	commands.push(clear, ping);

	client.on('interactionCreate', async (interaction: Interaction) => {
		if (!interaction.isChatInputCommand()) return;
		if (interaction.commandName === 'ping') {
			await interaction.reply({
				content: `Pong! API Latency is ${Math.round(client.ws.ping)}ms`,
				ephemeral: true,
			});
		}
		if (interaction.commandName === 'clear') {
			await interaction.reply({
				content: `Clearing messages...`,
				ephemeral: true,
			});

			const number = interaction.options.getNumber('number');
			const messages = await fetchMessages(interaction.channel, number);
			await deleteMessages(interaction.channel, messages)

			await interaction.editReply({
				content: `Cleared messages!`,
			})
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
		const inviteUrl = client.generateInvite({
			scopes: [
				OAuth2Scopes.Guilds,
				OAuth2Scopes.Bot,
			],
		});
		log("[📡] Bot ready!");
		console.log("Use this url to make me join your server: %s", inviteUrl);
	});

	client.login(get("token"));
}

export const fetchMessages = async (channel: Channel, limit: number): Promise<Collection<string, Message<boolean>>> => {
	const c = channel as TextChannel;
	return c.messages.fetch({ limit });
};

export const deleteMessages = (channel: Channel, messagesCollection: Collection<string, Message>) => {
	const c = channel as TextChannel;
	return c.bulkDelete(messagesCollection, true);
};
