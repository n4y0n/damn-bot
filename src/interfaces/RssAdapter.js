
module.exports = class RssAdapter {
    constructor(url) {
        this.url = url
    }

    onArticle(callback) {
        throw new Error("Unimplemented")
    }
    onError(callback) {
        throw new Error("Unimplemented")
    }
    run(callback) {
        throw new Error("Unimplemented")
    }
    destroy() {
        throw new Error("Unimplemented")
    }
}
