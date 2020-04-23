const { RichEmbed } = require('discord.js');
const Layer = require('../interfaces/Layer');
const log = require('../utils/logging').getLogger("AuguriBocc");

const messagi = ['🎉🎉🎈 Auguri Bocc!!! 🎈🎉🎉', '🎉 Buon Compleanno!!', "🎈🎈 Felice aniversario di nascita' 🎈🎈", "Hey Bocc... indovina. AUGURI!🎉"];

const randomMessage = () => {
    let rnd = Math.floor(Math.random() * messagi.length);
    return messagi[rnd]; 
}

class AuguriBocc extends Layer {
    constructor() {
        super();
        this.discordjs = { RichEmbed }
        log.i('Setting up timers...')
        this._timeToStart = 0;
        this._timeToEnd = (new Date('2020-3-31')).valueOf() - Date.now();
        if (this._timeToStart <= 0) {
            // throw Error('Cannot start in the past.')
            this._timeToStart = 1;
        }
        if (this._timeToEnd < 0) {
            throw Error('Cannot end before start');
        }

        this.targetBocc = null;
        this._intervalTime = 4 * 60 * 60 * 1000;
        this._intervalHandler = null;
        this._timeoutHandler = null;
    }

    initTimeout() {
        if (this._timeoutHandler) {
            throw Error('Timeout already started ticking.');
        }
        log.d("Time to start " + this._timeToStart)
        this._timeoutHandler = setTimeout(
            this.initInterval.bind(this),
            this._timeToStart
        );
    }

    endTimeout() {
        clearTimeout(this._timeoutHandler);
        this._timeoutHandler = null;
    }

    async initInterval() {

    }

    endInterval() {
        clearInterval(this._intervalHandler);
    }

    async onReady() {
        this.targetBocc = await this.bot.fetchUser('224977582846640128') // Change me, hardcodded bocc fetch
        // this.initTimeout();
        const channel = await this.bot.getChannel('538747728763682817')
        this._intervalHandler = setInterval(
            async () => {
                let msg = randomMessage();
                await channel.sendMessage(msg)
                if (this.targetBocc) {
                    log.debug('Sending pm to bocc.')
                    await this.targetBocc.send(msg)
                }
            },
            this._intervalTime
        );
        // setTimeout(this.endInterval.bind(this), this._timeToEnd);
    }

    install(bot) {
        super.install(bot);
        this.bot.on('ready', this.onReady.bind(this))
    }

    uninstall() {
        this.endTimeout();
        this.endInterval();
        super.uninstall();
    }

    status() {
        return `[${this.toString()}(${this.bot ? "Installed" : "Not Installed"})] Send every ${this._intervalTime}ms`
    }

    toString() {
        return 'AuguriBocc#' + this.getShortID();
    }
}