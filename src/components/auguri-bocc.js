const { RichEmbed } = require('discord.js');
const Component = require('../interfaces/Component');
const logger = require('../utils/logging');

class AuguriBocc extends Component {
    constructor(startDate, endDate, intervalSeconds, eventFn) {
        this._timeToStart = startDate - Date.now()
        this._timeToEnd = endDate - startDate;
        if (this._timeToStart < 0) {
            throw Error('Cannot start in the past.')
        }
        if (this._timeToEnd < 0) {
            throw Error('Cannot end before start')
        }

        this._intervalTime = intervalSeconds * 1000;
        this._eventFn = eventFn
        this._intervalHandler = null;
        this._timeoutHandler = null;
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
        this._intervalHandler = setInterval(eventFn.bind(this), this._interval)
        setTimeout(this.endInterval.bind(this), this._timeToEnd)
    }

    endInterval() {
        clearInterval(this._intervalHandler)
    }

    install(bot) {
        super.install(bot);
        this.initTimeout();
    }

    uninstall() {
        this.endTimeout();
        this.endInterval();
        super.uninstall();
    }

    toString() {
        return 'AuguriBocc#' + this.getShortID();
    }
}

module.exports = new AuguriBocc();
