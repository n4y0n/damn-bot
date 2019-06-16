const Command = require("../../../src/interfaces/Command")
const assert = require("assert")

describe("Command", () => {
    it("Should setup alias from first letter of name", () => {
        const command = new Command("test")

        assert(command.alias === "t")
    })
})
