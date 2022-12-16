const { Client, REST, IntentsBitField, Partials, Events } = require("discord.js");
const { setup, onReady, onInteraction, onReloadSettings, onDM } = require("./bot");
// Load bot configurations from $HOME/.discord-bot.json
const { load, get, onSettingsReloaded } = require("./config")
load().then(startBot);

async function startBot() {
	const log = require("debug")("bot:main");

	const client = new Client({
		intents: [
			IntentsBitField.Flags.Guilds,
			IntentsBitField.Flags.GuildMessages,
			IntentsBitField.Flags.GuildScheduledEvents,
			IntentsBitField.Flags.DirectMessages,
			IntentsBitField.Flags.MessageContent,
			IntentsBitField.Flags.DirectMessageTyping,
			IntentsBitField.Flags.DirectMessageReactions,
		],
		partials: [
			Partials.Channel,
			Partials.Message,
			Partials.Reaction,
		],
	});
	const rest = new REST({ version: '10' }).setToken(get("token"));


	process.on("unhandledRejection", err => {
		log("Unhandled promise rejection: %O", err);
		client.destroy();
		process.exit(0);
	});

	process.on("uncaughtException", err => {
		log("Uncaught exception: %O", err);
		client.destroy();
		process.exit(0);
	});

	process.on("SIGINT", () => {
		log("SIGINT received. Exiting...");
		client.destroy();
		process.exit(0);
	});

	await setup(client)

	client.on(Events.InteractionCreate, async interaction => {
		if (interaction.isChatInputCommand())
			log("[interactionCreate] command: %s by %s", interaction.commandName, interaction.user.tag);
		if (interaction.isButton())
			log("[interactionCreate] button: %s by %s", interaction.customId, interaction.user.tag);
		await onInteraction(interaction)
	});

	client.on(Events.MessageCreate, async message => {
		if (message.guild || message.author.bot) return;
		log("[messageCreate] message: %s by %s", message.content, message.author.tag);
		// const row = new ActionRowBuilder()
		// 	.addComponents(
		// 		new ButtonBuilder()
		// 			.setCustomId('primary')
		// 			.setLabel('Click me!')
		// 			.setStyle(ButtonStyle.Primary),
		// 	);

		// await message.reply({ content: 'I think you should,', components: [row] });
		await onDM(message)
	});

	client.on(Events.ClientReady, async () => {
		await onReady(client, rest)
		log("[📡] Bot ready!");
	});

	onSettingsReloaded(async () => {
		log("[📡] Settings reloaded!");
		await onReloadSettings(client)
	});

	await client.login(get("token"));
}
