const { Client, REST, SlashCommandBuilder, GatewayIntentBits, PermissionsBitField, Routes, OAuth2Scopes, EmbedBuilder } = require("discord.js");
const log = require("debug")("bot:main");
// Load bot configurations from $HOME/.discord-bot.json
const { load, get } = require("./config")
load().then(main);

const { pull: pullBocc, getCollection: getBoccs, getCollectionCount, getBalance, initBalance, incrementBalance, claimDaily, fetchBoccImageURL } = require("./boccha")

process.on("unhandledRejection", (err) => {
	log("Unhandled promise rejection: %O", err);
});

process.on("uncaughtException", (err) => {
	log("Uncaught exception: %O", err);
});

process.on("SIGINT", () => {
	log("SIGINT received. Exiting...");
	process.exit(0);
});

async function main() {
	await initBalance()

	setInterval(async () => {
		incrementBalance()
	}, 1000 * 60 * 5)

	const commands = []
	const client = new Client({
		intents: [
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildScheduledEvents,
		],
	});
	const rest = new REST({ version: '10' }).setToken(get("token"));

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

	const pull = new SlashCommandBuilder()
		.setName('pull')
		.setDescription('Pulls a random bocc from the database of boccs')
		.addIntegerOption(option =>
			option.setName('amount')
				.setDescription('The amount of boccs to pull')
				.setRequired(false)
				.setMinValue(1)
				.setMaxValue(5)
		)

	const collection = new SlashCommandBuilder()
		.setName('collection')
		.setDescription('Shows your collection of boccs')

	const balance = new SlashCommandBuilder()
		.setName('balance')
		.setDescription('Shows your balance')

	const daily = new SlashCommandBuilder()
		.setName('daily')
		.setDescription('Claim your daily balance')


	commands.push(clear, ping, help, m, pull, collection, balance, daily);

	client.on('interactionCreate', async (interaction) => {
		if (!interaction.isChatInputCommand()) return;
		if (interaction.commandName === 'ping') {
			await interaction.reply({
				content: `Pong! API Latency is ${Math.round(client.ws.ping)}ms`,
				ephemeral: true,
			});
		} else if (interaction.commandName === 'clear') {
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
		} else if (interaction.commandName === 'help') {
			await interaction.reply({
				content: `Commands: ${commands.map(command => command.name).join(", ")}`,
				ephemeral: true,
			});
		} else if (interaction.commandName === 'm') {
			const name = interaction.options.getString('name');
			await interaction.reply({
				content: getContentForMacro(name),
				ephemeral: false,
			});
		} else if (interaction.commandName === 'pull') {
			try {
				const amount = interaction.options.getInteger('amount') || 1
				const boccs = await pullBocc(interaction.user, amount);

				log(`${interaction.user.tag} pulled ${boccs.map(bocc => bocc.stars + bocc.name).join(", ")}`);
				const embed = new EmbedBuilder({
					type: "rich",
					title: `Pulled ${boccs.length} boccs`,
					description: "",
					color: 0x00FFFF,
					fields: boccs.map(bocc => ({
						name: "\u200B",
						value: `${bocc.name} (${bocc.stars})`,
					})),
					thumbnail: {
						url: fetchBoccImageURL(bocc),
						height: 0,
						width: 0
					},
					footer: {
						text: ``,
						icon_url: `https://cdn.discordapp.com/avatars/224977582846640128/5ab1c937b374310da6b2bedc57f0a880.png?size=1024`
					}
				})
				await interaction.reply({
					embeds: [embed],
					ephemeral: true,
				});
			} catch (e) {
				log(e);
				await interaction.reply({
					content: `${e}\n\`/balance\` for more info`,
					ephemeral: true,
				});
			}
		} else if (interaction.commandName === 'collection') {
			const boccs = await getBoccs(interaction.user);
			const allBoccsCount = await getCollectionCount();
			log(`${interaction.user.tag} has ${boccs.length} boccs`);

			const embed = new EmbedBuilder({
				title: `Bocc list`,
				type: "rich",
				description: "",
				color: 0x00FFFF,
				fields: boccs.map(bocc => ({
					name: "\u200B",
					value: `${bocc.name} (${bocc.stars})`,
				})),
				thumbnail: {
					url: `https://cdn.discordapp.com/avatars/224977582846640128/5ab1c937b374310da6b2bedc57f0a880.png?size=1024`,
					height: 0,
					width: 0
				},
				footer: {
					text: `You have ${boccs.length}/${allBoccsCount} Boccs`,
					icon_url: `https://cdn.discordapp.com/avatars/224977582846640128/5ab1c937b374310da6b2bedc57f0a880.png?size=1024`
				}
			})

			await interaction.reply({
				embeds: [embed],
				ephemeral: true,
			});

			if (boccs.length == 8) {
				await interaction.followUp({
					content: `You have all boccs! Congratulations!`,
					ephemeral: true,
				});
			}
		} else if (interaction.commandName === 'balance') {
			const balance = await getBalance(interaction.user);
			log(`${interaction.user.tag} has ${balance} bocc coins`);
			await interaction.reply({
				content: `You have ${balance} bocc coins\nYou can use them to pull boccs!\nUse \`/pull\` to pull a bocc\nThe cost of pulling a bocc is 10 bocc coins\nYou can get bocc coins by waiting, or by using the \`/daily\` command`,
				ephemeral: true,
			});
		} else if (interaction.commandName === 'daily') {
			try {
				const balance = await claimDaily(interaction.user);
				log(`${interaction.user.tag} claimed their daily balance of ${balance} bocc coins`);
				await interaction.reply({
					content: `You claimed your daily balance of ${balance} bocc coins!`,
					ephemeral: true,
				});
			} catch (e) {
				log(e);
				await interaction.reply({
					content: `${e}`,
					ephemeral: true,
				});
			}
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

async function fetchMessages(channel, limit) {
	return channel.messages.fetch({ limit });
};

function deleteMessages(channel, messagesCollection) {
	return channel.bulkDelete(messagesCollection, true);
};

function getContentForMacro(name) {
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