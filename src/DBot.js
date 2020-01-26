//@ts-check
const EnhancedClient = require("./interfaces/EnhancedClient")
const Processor = require("./interfaces/Processor")
const Component = require("./interfaces/Component")
const logger = require("./utils/logging")

module.exports = class DBot extends EnhancedClient {

    /**
     *
     * @param {Object} options
     */
    constructor (options) {
        super(options)
        this.components = {
            listeners: {},
            normal: {}
        }

        this.onMessage(async message => {
            if (message.author.id == this.user.id) return
            for (const component of Object.values(this.components.listeners)) {
                if (await component.process(message)) {
                    break
                }
            }
        })
    }

    addComponent (component) {
        if (!(component instanceof Component)) return logger.warn(`❌ ${component} is not a componet`, { location: this })
        
        if (component instanceof Processor) return this._addProcessorComponent(component)

        this._addNormalComponent(component)
    }

    removeComponent (component) {
        if (!(component instanceof Component)) return logger.warn(`❌ ${component} is not a componet`, { location: this })

        if (component instanceof Processor) return this._removeProcessorComponent(component)

        this._removeNormalComponent(component)
    }

    _addNormalComponent (component) {
        if (component === this.components.normal[component.getID()]) {
            logger.info(`❌ ${component} already installed`, { location: this })
            return
        }

        component.install(this)
        this.components.normal[component.getID()] = component
        logger.info(`✔ Added Component >> ${component}`, { location: this })
    }

    _addProcessorComponent (component) {
        if (component === this.components.listeners[component.getID()]) {
            logger.info(`❌ ${component} already installed`, { location: this })
            return
        }
        component.install(this)
        this.components.listeners[component.getID()] = component
        logger.info(`✔ Added Processor >> ${component}`, { location: this })
    }

    _removeNormalComponent (component) {
        const retrivedcomponent = this.components.normal[component.getID()]
        if (retrivedcomponent == null) {
            logger.warn(`❌ ${component} not installed in this bot`, { location: this })
            return
        }
        this.components.normal[component.getID()] = null
        retrivedcomponent.uninstall(this)
    }

    _removeProcessorComponent (component) {
        const retrivedcomponent = this.components.listeners[component.getID()]
        if (retrivedcomponent == null) {
            logger.warn(`❌ ${component} not installed in this bot`, { location: this })
            return
        }
        this.components.listeners[component.getID()] = null
        retrivedcomponent.uninstall(this)
    }


    toString () {
        return "MyBot"
    }
}
