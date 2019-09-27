//@ts-check
const { Client, Message } = require('discord.js')
const EventEmitter = require('events').EventEmitter

module.exports = class EnhancedClient extends Client {

    constructor(options) {
        super(options)
    }

    getChannel(id) {
        return this.channels.get(id)
    }

    start(token) {
        if (this.bus && 'emit' in this.bus) {
            this.on('ready', () => this.bus.emit('bot-ready'))
        }
        return this.login(token).then(() => undefined)
    }

    /**
     * @param {EventEmitter} bus 
     */
    register(bus) {
        if (!(bus instanceof EventEmitter)) throw new Error('Bus is not an EventEmitter')
        this.bus = bus
        this.on('message', message => this.bus.emit('bot-message', message))
        return this
    }

    registerOnReady(bus) {
        this.on('ready', () => {
            this.register(bus)
            this.bus.emit('bot-ready')
        })
        return this
    }

    toString() {
        return "Enhanced Discord.js Client"
    }
}
