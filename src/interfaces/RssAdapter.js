
module.exports = class RssAdapter {
    constructor(url) {
        this.url = url
    }

    onArticle(callback) {
        throw new Error("Uninplemented")
    }
    onError(callback) {
        throw new Error("Uninplemented")
    }
    run(callback) {
        throw new Error("Uninplemented")
    }
    destroy() {
        throw new Error("Uninplemented")
    }
}
