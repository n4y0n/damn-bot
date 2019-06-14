const EnhancedClient = require("./interfaces/EnhancedClient")
const Processor = require("./interfaces/Processor")
const Component = require("./interfaces/Component")
const logger = require("./utils/logging")


// TODO: Message logger

module.exports = class DBot extends EnhancedClient {

    /**
     *
     * @param {Object} options
     */
    constructor(options) {
        super(options)
        this.components = {
            processors: {},
            normal: {}
        }

        this.onMessage(async message => {
            const channelname = message.channel.name ? message.channel.name : "Private"
            logger.verbose(`New Message from ${message.author.username} in ${channelname}: ${message.content}`, { location: this })
            if (message.author.id == this.user.id) return
            for (const [key, component] of Object.entries(this.components.processors)) {
                await component.process(message)
            }
        })
    }

    addComponent(component) {
        if (!(component instanceof Component)) return logger.warn(`❌ ${component} is not a componet`, { location: this })
        if (component instanceof Processor) return this._addProcessorComponent(component)

        this._addNormalComponent(component)
    }

    removeComponent(component) {
        if (!(component instanceof Component)) return logger.warn(`❌ ${component} is not a componet`, { location: this })

        if (component instanceof Processor) return this._removeProcessorComponent(component)

        this._removeNormalComponent(component)
    }

    _addNormalComponent(component) {
        if (component === this.components.normal[component.getID()]) return logger.info(`❌ ${component} already installed`, { location: this })
        component.install(this)
        this.components.normal[component.getID()] = component
        logger.info(`✔ Added Component >> ${component}`, { location: this })
    }

    _addProcessorComponent(component) {
        if (component === this.components.processors[component.getID()]) return logger.info(`❌ ${component} already installed`, { location: this })
        component.install(this)
        this.components.processors[component.getID()] = component
        logger.info(`✔ Added Processor >> ${component}`, { location: this })
    }

    _removeNormalComponent(component) {
        const retrivedcomponent = this.components.normal[component.getID()]
        if (retrivedcomponent == null) return logger.warn(`❌ ${component} not installed in this bot`, { location: this })
        this.components.normal[component.getID()] = null
        retrivedcomponent.uninstall(this)
    }

    _removeProcessorComponent(component) {
        const retrivedcomponent = this.components.processors[component.getID()]
        if (retrivedcomponent == null) return logger.warn(`❌ ${component} not installed in this bot`, { location: this })
        this.components.processors[component.getID()] = null
        retrivedcomponent.uninstall(this)
    }


    toString() {
        return "MyBot"
    }
}
