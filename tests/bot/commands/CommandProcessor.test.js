const CommandProcessor = require("../../../src/commands/CommandProcessor")
const Command = require("../../../src/commands/Command")
const assert = require("assert")

describe("CommandProcessor", () => {
    it("Sould contain 2 commands", () => {
        const command_processor = new CommandProcessor("-")

        command_processor.addCommand(new Command("test", { listener() { } }))
        command_processor.addCommand(new Command("test2", { alias: "t2", listener() { } }))

        assert(command_processor.size() === 2)
    })

    it("Sould execute start hook", () => {

        const command_content = "-test"

        const command_processor = new CommandProcessor("-", {
            hooks: {
                onStartExecution() {

                    assert(this.message.content === command_content)
                    assert(this.proc === command_processor)

                }
            }
        })

        command_processor.addCommand(new Command("test", { listener() { } }))
        command_processor.addCommand(new Command("test2", { alias: "t2", listener() { } }))

        const message = { content: command_content }

        command_processor.process(message)
    })
})
