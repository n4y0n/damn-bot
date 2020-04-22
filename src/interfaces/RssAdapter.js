//@ts-check

const RssWatcher = require("rss-watcher");

module.exports = class RssAdapter {
    constructor (url) {
        this.url = url
    }

    onArticle (callback) {
        throw new Error("Unimplemented")
    }
    onError (callback) {
        throw new Error("Unimplemented")
    }
    run (callback) {
        throw new Error("Unimplemented")
    }
    destroy () {
        throw new Error("Unimplemented")
    }

    static create(url) {
        const reader = new RssWatcher(url)
        
        reader.onArticle = function(listener) {
            this.on("new article", listener)
        }
    
        reader.onError = function(listener) {
            this.on("error", listener)
        }
    
        reader.run = function(errCallback) {
            return new Promise((resolve, reject) => {
                this.run((err) => {
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
    
        reader.destroy = function() {
            this.destroy().then(() => { }, err => this._watcher.emit("error", err))
        }

        return reader; 
    }
}
