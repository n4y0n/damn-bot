const RssFeedComponent = require("../../../src/components/RssFeedComponent")
const { MockRssAdapter } = require("../../utils/utils")
const assert = require("assert")

describe("RssFeedComponent", () => {
    it("should be named 'hello'", () => {
        const rssadapter = MockRssAdapter()
        const rssFeedComponent = new RssFeedComponent(rssadapter, "hello")

        assert(rssFeedComponent.getFeedName() === "hello")
    })

    it("should have 538747728763682817 as first subscriber", () => {
        const rssadapter = MockRssAdapter()
        const rssFeedComponent = new RssFeedComponent(rssadapter)

        rssFeedComponent.addChannel("538747728763682817")

        assert(rssFeedComponent.subscribedChannels[0] === "538747728763682817")
    })
})
