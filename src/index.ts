import {
	Channel,
	Client,
	Collection,
	GatewayIntentBits,
	Interaction,
	Message,
	OAuth2Scopes,
	PermissionsBitField,
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
		.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator | PermissionsBitField.Flags.ManageMessages)
		.setDMPermission(false);
	
	const autoban = new SlashCommandBuilder()
		.setName('autoban')
		.setDescription('Autoban')
		.addStringOption(option =>
			option.setName('enable')
				.setDescription('Randomly ban people UwU')
				.setRequired(true)
				.addChoices({name: 'Enable', value: 'enable'}, {name: 'Disable', value: 'disable'})
		)
		//.setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
		.setDMPermission(false);

	const ping = new SlashCommandBuilder()
		.setName('ping')
		.setDMPermission(false)
		.setDescription('Replies with Pong!');

	const help = new SlashCommandBuilder()
		.setName('help')
		.setDMPermission(false)
		.setDescription('Replies with a list of commands');

	const m = new SlashCommandBuilder()
		.setName('m')
		.setDescription('Macro commands')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('The name of the macro')
				.setRequired(true)
				.addChoices({ name: 'bonk', value: 'bonk' })
		)

	commands.push(clear, ping, help, m, autoban);

	client.on('interactionCreate', async (interaction: Interaction) => {
		if (!interaction.isChatInputCommand()) return;
		if (interaction.commandName === 'ping') {
			await interaction.reply({
				content: `Pong! API Latency is ${Math.round(client.ws.ping)}ms`,
				ephemeral: true,
			});
		} else
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
		} else
		if (interaction.commandName === 'help') {
			await interaction.reply({
				content: `Commands: ${commands.map(command => command.name).join(", ")}`,
				ephemeral: true,
			});
		} else
		if (interaction.commandName === 'm') {
			const name = interaction.options.getString('name');
			await interaction.reply({
				content: getContentForMacro(name),
				ephemeral: true,
			});
		} else
		if (interaction.commandName === 'autoban') {
			const enable = interaction.options.getString('enable');
			await interaction.reply({
				content: `Sorry, not implemented yet 🤭✌️`,
				ephemeral: true,
			})
			// if (enable === 'enable') {
			// 	await interaction.reply({
			// 		content: `Autoban enabled!`,
			// 		ephemeral: true,
			// 	});
			// } else if (enable === 'disable') {
			// 	await interaction.reply({
			// 		content: `Autoban disabled!`,
			// 		ephemeral: true,
			// 	});
			// }
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