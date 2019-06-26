const RssWatcher = require("rss-watcher")
const RssAdapter = require("../interfaces/RssAdapter")

module.exports = class RssWatcherAdapter extends RssAdapter {
    constructor(feedurl) {
        super(feedurl)
        this._watcher = new RssWatcher(feedurl)
    }

    onArticle(listener) {
        this._watcher.on("new article", listener)
    }

    onError(listener) {
        this._watcher.on("error", listener)
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
