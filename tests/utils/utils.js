const RssAdapter = require("../../src/interfaces/RssAdapter")
class rss_adapter extends RssAdapter {
    constructor() {
        super()
    }
    on(evnt, callback) {
    }
    run(callback) {
    }
    destroy() {
    }
}

module.exports = {
    MockRssAdapter() {
        return new rss_adapter()
    }
}
