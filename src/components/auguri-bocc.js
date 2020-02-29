const { RichEmbed } = require('discord.js');
const Component = require('../interfaces/Component');
const logger = require('../utils/logging');

class AuguriBocc extends Component {
    constructor(startDate, endDate, intervalSeconds, eventFn) {
        super();
        this.discordjs = { RichEmbed }
        logger.info('Setting up timers...', {location:this})
        this._timeToStart = startDate - Date.now();
        this._timeToEnd = endDate - startDate;
        if (this._timeToStart < 0) {
            // throw Error('Cannot start in the past.')
            this._timeToStart = 0;
        }
        if (this._timeToEnd < 0) {
            throw Error('Cannot end before start');
        }
        
        this.targetBocc = null;
        this._intervalTime = intervalSeconds * 1000;
        this._eventFn =
            eventFn ||
            function() {
                logger.debug('Do nothing', { location: this });
            };
        this._intervalHandler = null;
        this._timeoutHandler = null;
        logger.info(`👌 Starting ${new Date(Date.now() + this._timeToStart).toString()}, ending ${new Date(Date.now() + this._timeToStart + this._timeToEnd).toString()}`, {location:this})
        logger.info(`👌 Sending message every ${((this._intervalTime/1000) / 60) / 24} hours`, {location:this})
    }

    initTimeout() {
        if (this._timeoutHandler) {
            throw Error('Timeout already started ticking.');
        }

        this._timeoutHandler = setTimeout(
            this.initInterval.bind(this),
            this._timeToStart
        );
    }

    endTimeout() {
        clearTimeout(this._timeoutHandler);
        this._timeoutHandler = null;
    }

    initInterval() {
        this._intervalHandler = setInterval(
            this._eventFn.bind(this),
            this._intervalTime
        );
        setTimeout(this.endInterval.bind(this), this._timeToEnd);
    }

    endInterval() {
        clearInterval(this._intervalHandler);
    }

    async onReady() {
        this.targetBocc = await this.bot.fetchUser('224977582846640128') // Change me, hardcodded bocc fetch
        this.initTimeout();
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

module.exports = (startDate, endDate, intervalSeconds, eventFn) =>
    new AuguriBocc(startDate, endDate, intervalSeconds, eventFn);
