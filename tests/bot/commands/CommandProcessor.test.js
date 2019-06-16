const CommandProcessor = require("../../../src/commands/CommandProcessor")
const Command = require("../../../src/interfaces/Command")
const assert = require("assert")

describe("CommandProcessor", () => {
    it("Sould contain 2 commands", () => {
        const command_processor = new CommandProcessor("-")

        command_processor.addCommand(new Command("test"))
        command_processor.addCommand(new Command("test2", { alias: "t2" }))

        assert(command_processor.size() === 2)
    })
})
