import { fdatasync } from "fs";
import { open } from "fs/promises";
import { homedir } from "os";
import { join } from "path";

const configPath = join(homedir(), ".discord-bot.conf");

let store = new Map<string | Symbol, any>();

export async function config() {
	let data = null;

	try {
		const fh = await open(configPath, "r");
		data = await fh.readFile({ encoding: "utf-8" });
		await fh.close();
	} catch (e) {
        console.log("[💔] Error configuration file not found.");
        console.log(" |  " + e);
        console.log(" |  Will now use default config." )
        return await save();
    }

	try {
		const j = JSON.parse(data);
		for (let [key, value] of Object.entries(j)) {
			store.set(key, value);
		}
	} catch (e) {
		console.log("[💔] Error parsing configuration file.");
        console.log(" |  " + e);
        console.log(" |  Will now use default config." )
        return await save();
	}
}

export async function save() {
	let data = {};

	for (const [key, val] of store.entries()) {
		if (key.toString().startsWith("Symbol")) continue;

		//@ts-ignore
		data[key] = val;
	}

	const fh = await open(configPath, "w+");
	await fh.writeFile(JSON.stringify(data, null, 2), { encoding: "utf-8" });
	await fh.close();
}

export function get(key: "client" | string | Symbol, def?: any): any {
	return store.get(key) || def;
}

export function set(key: string | Symbol, value: any): void {
	store.set(key, value);

	if (typeof key === "string")
		save();
}

export const MagicNames = {
	CLIENT: Symbol.for("client"),
}