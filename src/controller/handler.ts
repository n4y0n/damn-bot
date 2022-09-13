import { Message } from "discord.js";
import { checkCommand } from "./checkproc";
import { deleteMessages, fetchMessages } from "./clear";

export const handleMessage = async (message: Message) => {
    const [command, ...args] = message.content.split(" ");

    switch (command) {
        case "cls":
        case "clear":
            await clear(message, args);
            await message.delete(1000);
            break;
        case "ping":
            await ping(message);
            break;
        case "checkproc":
            await checkCommand(message);
            break;
        default:
            break;
    }
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

    const messages = await fetchMessages({ message, arguments: { num } });
    await deleteMessages({ message, arguments: { num } }, messages);
}


async function ping(message: Message) {
    const sent = await message.channel.send("Pinging...");
    sent.edit(`Pong! Latency is ${sent.createdTimestamp - message.createdTimestamp}ms. API Latency is ${Math.round(message.client.ping)}ms`);
}