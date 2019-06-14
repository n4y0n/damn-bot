const CommandProcessorComponet = require("../../../../src/components/processors/CommandProcessorComponet")
const { MockCli } = require("../../../utils/utils")
const assert = require("assert")

describe("CommandProcessorComponent", () => {
    it("Should be listening for messages in 2 channels", () => {
        const command_prefix = "-"

        const cli = MockCli({
            prefix: command_prefix,
            commands: {
                "test": function () { },
                "cose": function () { }
            }
        })

        const command_processor_component = new CommandProcessorComponet(cli).addListenChannel("2").addListenChannel("3")

        assert(command_processor_component.listeningChannels.length === 2)
    })
})
