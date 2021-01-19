import { Client, Message } from "discord.js";
import { get } from "../config";

export async function commandHandler(message: Message) {
    if (message.author.bot) return;

    if (message.isMentioned(get("client").user)) {
        console.log("[🛰️] mentioned by "+ message.author.username +".")
        await message.react("✨");
    }

    if ((get("prefix", null) && message.content.startsWith(get("prefix")))
            || message.isMentioned(get("client").user)) {
        await dispatchMessage(message);
    }
}

async function dispatchMessage(message: Message) {
    const client: Client = get("client");

    if (message.isMentioned(get("client").user)) {
        message.content = message.content.replace("<@!" + get("client").user.id + ">", "").trim();
        if (!message.content) return;
    }

    if (message.content === "play") {
        const voiceConnection = await message.member.voiceChannel.join();
    }

    if (message.content === "stop") {
        message.member.voiceChannel.leave();
    }
}