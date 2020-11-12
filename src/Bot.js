//@ts-check
const { Client } = require("discord.js")

module.exports = class Bot {
    /**@type {Client} */
    client = null;
    config = null;

    constructor (client, config) {
        this.client = client;
        this.config = config;
    }
}
