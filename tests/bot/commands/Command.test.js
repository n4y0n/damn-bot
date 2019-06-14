const Command = require("../../../src/commands/Command")
const assert = require("assert")

describe("Command", () => {
    it("Should setup alias from first letter of name", () => {
        const command = new Command("test", {
            listener() {}
        })

        assert(command.alias === "t")
    })
})
