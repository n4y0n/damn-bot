import { Collection, Message } from "discord.js";
import { Command } from "../types/commands";

export const fetchMessages = async (command: Command) => {
	const messages = await command.message.channel.fetchMessages({ limit: command.arguments.num });
	return messages.filter(message => message.id !== command.message.id);
};

export const deleteMessages = async (command: Command, messagesCollection: Collection<string, Message>) => {
	return command.message.channel.bulkDelete(messagesCollection, true);
};
