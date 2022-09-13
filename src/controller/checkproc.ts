import debug from "debug";
import { Client, Message } from "discord.js";
import { get, Utils } from "../config";

const log = debug("bot:checkproc");
const authorized = [];
const notifiList = [];

export default async (client: Client) => {
    await setupIntervals(client);
    await setupNotifications(client);
    await setupCommandPermissions(client);
}

export const checkCommand = async (message: Message) => {
    log("[📡] Checking command permissions for %s", message.author.id);
    if (message.author.id in authorized) {
        log("[📡] Authorized user %s checking process", message.author.id);
        const process = await Utils.displayProcessBy("node");
        message.channel.send(process);
    }
}

async function setupCommandPermissions(client: Client) {
    log("[📡] Setting up command permissions");
    authorized.push(get("owner"));
}

async function setupIntervals(client: Client) {
    log("[📡] Setting up intervals");
    if (process.platform === 'win32') return;

    // // TODO: Setup interval for h@h process check
    // setInterval(async () => {
    //     const process = await Utils.displayProcessBy("node");
    //     log(process);
    // }, 60000);

}

async function setupNotifications(client: Client) {
    log("[📡] Setting up notifications");
    notifiList.push(get("owner"));
}

async function notify(client: Client, message: string) {
    log("[📡] Notifying");
    for (const id of notifiList) {
        const user = await client.fetchUser(id);
        user.send(message);
    }
}