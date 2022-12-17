const log = require("debug")("bot:application");
const { SlashCommandBuilder, OAuth2Scopes, Routes, EmbedBuilder, PermissionsBitField, Message, AttachmentBuilder, Client, REST, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const { fetchUsers, pull: pullBocc, getCollection: getBoccs, getCollectionCount, getBalance, initBalance, incrementBalance, claimDaily, getPullCount } = require("./boccha");
const { get } = require("./config");

const COMMANDS = []

async function setup() {
    await initBalance(get("clearBalanceOnStart"))
    setInterval(async () => {
        const users = await fetchUsers()
        for (const user of users) {
            await incrementBalance(user)
        }
    }, 1000 * 60 * 5)

    const clearCommand = new SlashCommandBuilder()
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

    log("Setting up clear command");

    const pingCommand = new SlashCommandBuilder()
        .setName('ping')
        .setDMPermission(false)
        .setDescription('Replies with Pong!');

    log("Setting up ping command");

    const macroCommand = new SlashCommandBuilder()
        .setName('m')
        .setDescription('Macro commands')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the macro')
                .setRequired(true)
                .addChoices({ name: 'bonk', value: 'bonk' })
        )
    log("Setting up m command");

    const pullCommand = new SlashCommandBuilder()
        .setName('pull')
        .setDescription('Pulls a random bocc from the database of boccs')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('The amount of boccs to pull')
                .setRequired(false)
                .setMinValue(1)
                .setMaxValue(5)
        )

    log("Setting up pull command");

    const collectionCommand = new SlashCommandBuilder()
        .setName('collection')
        .setDescription('Shows your collection of boccs')
        .addBooleanOption(option =>
            option.setName('share')
                .setDescription('Share your collection with the server')
                .setRequired(false)
        )

    log("Setting up collection command");

    const balanceCommand = new SlashCommandBuilder()
        .setName('balance')
        .setDescription('Shows your balance')

    log("Setting up balance command");

    const dailyCurrencyCommand = new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Claim your daily balance')

    log("Setting up daily command");

    const helpCommand = new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows the help menu')

    log("Setting up help command");

    const gachaCommand = new SlashCommandBuilder()
        .setName('gacha')
        .setDescription('Shows the gacha menu')

    log("Setting up gacha command");

    COMMANDS.push(clearCommand, pingCommand, helpCommand, macroCommand, pullCommand, collectionCommand, balanceCommand, dailyCurrencyCommand, gachaCommand);
}

/**
 * @param {import("discord.js").Interaction} interaction 
 * @returns 
 */
async function onInteraction(interaction) {
    if (interaction.commandName === 'gacha') {
        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('pull')
                    .setLabel('Pull')
                    .setStyle(ButtonStyle.Primary),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('collection')
                    .setLabel('Collection')
                    .setStyle(ButtonStyle.Secondary),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('balance')
                    .setLabel('Balance')
                    .setStyle(ButtonStyle.Secondary),
            )
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('daily')
                    .setLabel('Daily')
                    .setStyle(ButtonStyle.Secondary),
            );

        await interaction.reply({ content: 'Gacha commands:', components: [row] });
    } else if (interaction.commandName === 'ping') {
        await interaction.reply({
            content: `Pong! API Latency is ${Math.round(interaction.client.ws.ping)}ms`,
            ephemeral: true,
        });
        log("Pinged! API Latency is %sms", Math.round(interaction.client.ws.ping));
    } else if (interaction.commandName === 'clear') {
        // check permissions for the user
        const permissions = interaction.channel.permissionsFor(interaction.user);
        if (!permissions.has(PermissionsBitField.Flags.ManageMessages) && !permissions.has(PermissionsBitField.Flags.Administrator) && interaction.user.id !== get("owner")) {
            await interaction.reply({
                content: "You don't have the permissions to do that",
                ephemeral: true,
            });
            return;
        }

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
        const share = interaction.options.getBoolean('share');
        const boccs = await getBoccs(interaction.user);
        const allBoccsCount = await getCollectionCount();
        const counts = await getPullCount(interaction.user);
        log(`${interaction.user.tag.split("#")[0]} has ${boccs.length} boccs`);

        const embed = new EmbedBuilder({
            title: `${interaction.user.tag.split("#")[0]} Bocc list`,
            type: "rich",
            description: "",
            color: 0x00FFFF,
            fields: boccs.map(bocc => ({
                name: "\u200B",
                value: `${bocc.name} (${bocc.stars}) [${counts[bocc.id].count}]`,
            })),
            thumbnail: {
                url: interaction.user.avatarURL({ format: "png", size: 1024 }),
                height: 0,
                width: 0
            },
            footer: {
                text: `You have ${boccs.length}/${allBoccsCount} Boccs and have pulled ${counts.total} Boccs`,
                icon_url: `https://cdn.discordapp.com/avatars/224977582846640128/5ab1c937b374310da6b2bedc57f0a880.png?size=1024`
            }
        })

        await interaction.reply({
            embeds: [embed],
            ephemeral: !share,
        });

        if (boccs.length == allBoccsCount) {
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
    } else if (interaction.commandName === 'help') {
        await interaction.reply({
            content: `Commands:\n\`/pull\` - Pull a bocc\n\`/collection\` - View your bocc collection\n\`/balance\` - View your bocc coin balance\n\`/daily\` - Claim your daily bocc coins\n\`/clear\` - Clear messages\n\`/m\` - Use a macro\n\`/help\` - View this help message`,
            ephemeral: true,
        });
    }
}

/**
 * 
 * @param {import("discord.js").Interaction} interaction 
 */
async function onButton(interaction) {
    log("[onInteraction] Button pressed");
    if (interaction.customId === 'pull') {
        const boccs = await pullBocc(interaction.user, 1)
        const embed = new EmbedBuilder()
            .setTitle(`You pulled`)
            .setDescription(boccs.map(bocc => bocc.name).join(", "))
            .setFooter({ text: `You now have ${(await getPullCount(interaction.user)).total} pulls` })
            .setColor(0x00ff00)
        await interaction.reply({ embeds: [embed], ephemeral: true })
    } else if (interaction.customId === 'collection') {
        const collection = await getBoccs(interaction.user)
        const embed = new EmbedBuilder()
            .setTitle(`Your collection`)
            .setDescription(collection.map(bocc => bocc.name).join(", "))
            .setFooter({ text: `You have ${await getCollectionCount(interaction.user)} boccs` })
            .setColor(0x00ff00)
        await interaction.reply({ embeds: [embed], ephemeral: true })
    } else if (interaction.customId === 'balance') {
        const balance = await getBalance(interaction.user)
        const embed = new EmbedBuilder()
            .setTitle(`Your balance`)
            .setDescription(`You have ${balance} bocc currency`)
            .setColor(0x00ff00)
        await interaction.reply({ embeds: [embed], ephemeral: true })
    } else if (interaction.customId === 'daily') {
        try {
            const balance = await claimDaily(interaction.user)
            const embed = new EmbedBuilder()
                .setTitle(`Your daily balance`)
                .setDescription(`You have claimed ${balance} bocc currency`)
                .setColor(0x00ff00)
            await interaction.reply({ embeds: [embed], ephemeral: true })
        } catch (e) {
            const embed = new EmbedBuilder()
                .setTitle(`Your daily balance`)
                .setDescription(`You have already claimed your daily balance`)
                .setColor(0xff0000)
            await interaction.reply({ embeds: [embed], ephemeral: true })
        }
    }
}

/**
 * 
 * @param {Client} client 
 * @param {REST} rest 
 */
async function onReady(client, rest) {
    const status = get("status");
    const game = get("game");

    await rest.put(Routes.applicationCommands(client.user.id), { body: COMMANDS },);

    client.user.setActivity(game);
    client.user.setStatus(status);
    const inviteUrl = client.generateInvite({
        scopes: [
            OAuth2Scopes.Guilds,
            OAuth2Scopes.Bot,
        ],
    });
    console.log("Use this url to make me join your server: %s", inviteUrl);
}

async function onReloadSettings(client) {
    const status = get("status");
    const game = get("game");
    client.user.setActivity(game);
    client.user.setStatus(status);
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

// FIXME: Fix this
/**
 * @param {Message} message 
 */
async function onDM(message) {
    log(message.author.username + ' sent a DM: ' + message.content);
    const bot = message.client;

    if (message.content.startsWith('!')) {
        const args = message.content.slice(1).trim().split(/ +/g);
        const command = args.shift().toLowerCase();

        if (command === 'relay') {
            if (!message.attachments.first())
                return message.reply("You need to attach an image to relay it to the server!");

            const guild = await bot.guilds.fetch("147068676275830785")
            const channel = guild.channels.cache.find(channel => channel.name === "roberandom");
            const image = new AttachmentBuilder()
                .setFile(message.attachments.first().url)
                .setName(message.attachments.first().name)
            await channel.sendTyping()
            await channel.send({
                content: "_ _",
                files: [image]
            });
        }
    }
}

module.exports = {
    setup,
    onInteraction,
    onReady,
    onReloadSettings,
    onButton,
    onDM,
}