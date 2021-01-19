import { Message } from "discord.js";
import { get } from "../config";

export async function commandHandler(message: Message) {
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
    
}