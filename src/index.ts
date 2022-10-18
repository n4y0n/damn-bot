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
				.setMaxValue(100)
				.setMinValue(1)
				.setDescription('The number of messages to clear')
				.setRequired(true)
		)
		.setDMPermission(false);

	const ping = new SlashCommandBuilder()
		.setName('ping')
		.setDMPermission(false)
		.setDescription('Replies with Pong!');

	const help = new SlashCommandBuilder()
		.setName('help')
		.setDMPermission(false)
		.setDescription('Replies with a list of commands');

	const macro = new SlashCommandBuilder()
		.setName('macro')
		.setDescription('Macro commands')
		.addSubcommand(subcommand =>
			subcommand.setName('add')
				.setDescription('Add a macro')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('The name of the macro')
						.setRequired(true)
				)
				.addStringOption(option =>
					option.setName('content')
						.setDescription('The content of the macro')
						.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand.setName('remove')
				.setDescription('Remove a macro')
				.addStringOption(option =>
					option.setName('name')
						.setDescription('The name of the macro')
						.setRequired(true)
				)
		)
		.addSubcommand(subcommand =>
			subcommand.setName('list')
				.setDescription('List all macros')
		)
		.addSubcommand(subcommand =>
			subcommand.setName('clear')
				.setDescription('Clear all macros')
		)
		.setDMPermission(false);

	const m = new SlashCommandBuilder()
		.setName('m')
		.setDescription('Macro commands')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('The name of the macro')
				.setRequired(true)
				.addChoices({ name: 'bonk', value: 'bonk' }, { name: 'bbonk', value: 'bonk2' })
		)

	commands.push(clear, ping, help, macro, m);

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
			log(`Deleting ${messages.size} messages`);
			await deleteMessages(interaction.channel, messages)

			await interaction.editReply({
				content: `Cleared messages!`,
			})
		}
		if (interaction.commandName === 'help') {
			await interaction.reply({
				content: `Commands: ${commands.map(command => command.name).join(", ")}`,
				ephemeral: true,
			});
		}
		if (interaction.commandName === 'macro') {
			const subcommand = interaction.options.getSubcommand();
			if (subcommand === 'add') {
				const name = interaction.options.getString('name');
				const content = interaction.options.getString('content');
				await interaction.reply({
					content: `Adding macro ${name} with content ${content}`,
					ephemeral: true,
				});
			}
			if (subcommand === 'remove') {
				const name = interaction.options.getString('name');
				await interaction.reply({
					content: `Removing macro ${name}`,
					ephemeral: true,
				});
			}
			if (subcommand === 'list') {
				await interaction.reply({
					content: `Listing macros`,
					ephemeral: true,
				});
			}
			if (subcommand === 'clear') {
				await interaction.reply({
					content: `Clearing macros`,
					ephemeral: true,
				});
			}
		}
		if (interaction.commandName === 'm') {
			const name = interaction.options.getString('name');
			await interaction.reply({
				content: getContentForMacro(name),
				ephemeral: true,
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

export const getContentForMacro = (name: string): string => {
	switch (name) {
		case 'bonk':
			return 'https://tenor.com/view/bonk-gif-20120291';
		case 'bonk2':
			return `⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠻⣿⣿⣿⣿⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣶⣿⣿⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
			⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠰⡡⢌⢆⠂⡀⢌⢎⠜⡌⢎⢎⢞⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
			⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠀⡜⡔⡌⡜⡌⢎⢌⠜⡜⡜⡜⢆⢎⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
			⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⠄⠀⠠⠂⡐⡰⡡⡡⣌⢎⢎⢎⢎⢎⢞⢽⠂⢸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⢢⢢⣿⣿⣿⣿⣿⣿⣿
			⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⡐⡔⠔⡐⡔⡔⡱⣱⣲⡤⠀⠀⠀⡀⡑⡑⠱⡡⡸⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠻⡇⠟⠋⠉⢹⣿⣿⢡⢢⣹⢣⣿⣿⣿⣿⣿⣿⣿
			⣿⣿⣿⣿⣿⣿⣿⣿⡿⡡⠢⡂⡌⢆⢌⢒⢱⠽⣻⣻⣿⢯⢯⣻⡝⡔⢄⠄⡀⠐⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠛⣿⣿⣧⢻⣿⣿⣿⠣⢢⢣⢣⣿⣿⣿⣿⣿⣿⣿⣿⣿
			⣿⣿⣿⣿⣿⣿⠟⢆⢆⢆⢆⠆⢂⢂⠆⠥⢣⠭⣫⣻⢿⣟⣟⠽⡭⢭⢫⢲⠄⠀⠀⠘⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⢈⠙⠳⠹⣿⣿⣿⢏⢢⢣⢃⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
			⣿⣿⣿⣿⡿⡒⠰⡡⡌⡒⠥⢢⢢⢂⠐⡐⡐⢌⢎⢹⡽⣏⠌⠀⠘⡜⡞⡜⡔⠀⠀⠀⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠛⠻⣿⣿⣆⣿⣿⣿⡿⠰⡱⡡⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
			⣿⣿⣿⡿⠠⠠⢂⠠⢡⢣⢣⢣⢣⢣⢣⣊⢲⢡⢣⢣⣻⡽⡜⣒⠔⡄⡐⢄⣶⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣧⢿⣿⡇⣿⣿⣿⣿⢡⡘⡌⣾⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿
			⣿⣿⣿⢢⢂⠄⠐⡐⡐⢄⢂⢣⢫⢫⢯⣻⣻⣻⢯⣻⣻⢿⣿⣟⡽⣳⣝⣽⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⠏⣶⢹⣿⣿⣿⣿⣿⣿⡋⡜⢆⠆⢂⢂⠄⠄⠄⠀⠀⠌⢻⣿⣿⣿⣿⣿⣿⣿
			⣿⣿⠡⢢⢢⠢⠠⠀⢂⢌⢎⢎⣎⡝⡝⣝⡽⡽⣻⣻⣿⣿⣿⡿⣿⣿⢿⢿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡈⣿⢰⣿⣿⣿⢍⢎⢆⢣⠡⢂⠀⡰⡠⠠⠀⠀⠀⠀⡀⠄⢻⣿⣿⣿⣿⣿
			⣿⠃⠀⠠⠢⠢⡂⠄⠄⢂⢂⢣⢻⣻⣻⣟⡿⣻⢿⢿⡿⡿⣿⣿⣻⡽⣻⣻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢣⢃⠂⢀⠀⠄⡜⣝⡽⣣⢢⠠⠠⠠⢀⠄⠄⠄⠸⣿⣿⣿⣿
			⣿⠢⠠⠠⡐⡐⠰⡐⡐⡐⠔⡔⡔⡝⣟⣟⣟⣟⣟⣟⣟⣟⣟⣟⡝⡭⣫⢻⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⢏⠎⠀⠀⢀⢐⠔⡌⡌⢎⢏⢏⢎⢆⢂⢂⠄⡐⠄⠄⠄⢹⣿⣿⣿
			⣿⡐⡐⠄⢂⢂⢂⢂⢂⠄⢂⢂⠆⡌⢎⢭⢫⢯⢯⢯⣻⣻⠽⡽⡽⡽⡹⣼⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡟⡔⠄⠀⠀⠠⢢⢢⠢⡀⠠⢣⢯⢫⢎⢆⠆⢂⠐⠄⢂⠄⠄⡀⠹⣿⣿
			⣿⣇⠄⠄⢂⠄⡐⡐⡐⠄⠀⠄⢢⢌⢒⢱⢭⣫⢫⢫⢫⢎⢍⢯⣻⢯⢯⢺⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⡱⣼⣿⠀⠀⠀⠰⢢⢂⠄⠀⡌⡞⡽⡭⢎⢎⠢⢂⠄⠄⠄⠄⠄⠄⠄⠸⣿
			⣿⣿⣷⠐⠄⠄⠄⠄⡀⠀⠀⠠⠢⡱⡱⡱⡽⣘⡜⡜⡜⢀⠠⣘⣟⣟⣟⡝⢿⣿⣿⣿⣿⣿⣿⣿⣿⢡⣸⣿⣿⣿⣦⠀⠀⠠⡀⠀⠄⢆⢣⣏⢯⢫⣊⢆⠆⢂⠄⠄⠠⡀⠄⠄⡐⠄⢽
			⣿⣿⣿⣿⣦⡀⠄⡀⠀⠀⠀⡐⡐⠥⢣⢫⢯⢎⢞⡜⡖⡄⡀⢢⢫⢯⣻⣳⣷⣡⣡⢩⢋⢯⢻⢍⢢⣿⣿⣿⣿⣿⣿⣿⣿⣯⢢⢢⢣⡹⣹⡹⡹⡜⡌⠆⠄⠄⠄⠄⠠⠠⡐⡐⡐⡐⠌`;
		default:
			return 'Macro not found';
	}
}