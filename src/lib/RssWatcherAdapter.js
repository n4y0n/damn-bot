const RssWatcher = require("rss-watcher")
const RssAdapter = require("../interfaces/RSSAdapter")

module.exports = class RssWatcherAdapter extends RssAdapter {
    constructor(feedurl) {
        super()
        this._watcher = new RssWatcher(feedurl)
    }

    on(evnt, listener) {
        if (evnt === "new-item") {
            this._watcher.on("new article", listener)
            return
        }
        this._watcher.on(evnt, listener)
    }

    run(errCallback) {
        return new Promise((resolve, reject) => {
            this._watcher.run((err) => {
                if (err) {
                    if ((errCallback instanceof Function)) {
                        errCallback(err)
                    }
                    return reject(err)
                }
                resolve()
            })
        })
    }

    destroy() {
        this._watcher.destroy().then(() => {}, err => this._watcher.emit("error", err))
    }
}
