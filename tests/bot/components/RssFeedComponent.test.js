const RssFeedComponent = require("../../../src/components/RssFeedComponent")
const { MockRssAdapter } = require("../../utils/utils")
const assert = require("assert")

describe("RssFeedComponent", () => {

    // Test 1
    it("should be named 'hello'", () => {
        // Setup
        const rssadapter = MockRssAdapter()
        const rssFeedComponent = new RssFeedComponent(rssadapter, "hello")

        // Act
        const rss_feed_name = rssFeedComponent.getFeedName()

        // Test
        assert(rss_feed_name === "hello")
    })

    // Test 2
    it("should have 538747728763682817 as first subscriber", () => {
        // Setup
        const rssadapter = MockRssAdapter()
        const rssFeedComponent = new RssFeedComponent(rssadapter)
        rssFeedComponent.addChannel("538747728763682817")

        // Act
        const first_subscriber_channel = rssFeedComponent.subscribedChannels[0]

        // Test
        assert(first_subscriber_channel === "538747728763682817")
    })
})
