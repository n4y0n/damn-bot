const Component = require("./Component")

module.exports = class Processor extends Component {
    async process(something) { throw new Error(`Uninplemented method process in ${this}`) }
}