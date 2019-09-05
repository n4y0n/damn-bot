//@ts-check
const axios = require('axios').default
const url = require('url')

/**
 * Simple rest api client
 */
module.exports = class RestClient {
    /**
     * Simple rest api client
     * @param {string} baseUrl
     * @throws Invalid url
     */
    constructor (baseUrl) {
        /**
         * @type {url.URL}
         */
        this._baseUrl = null
        this.BaseUrl = baseUrl
        this._headers = {
            'Accept': 'application/json'
        }
        this._parameters = {}

        this._client = axios.create({
            baseURL: this.BaseUrl,
            timeout: 1000,
            headers: this._headers
        })
    }

    async Get (path, params) {
        let p = Object.assign(this._parameters, params)
        return this._client.get(path, p)
    }

    async Post (path, data, params = null) {
        return this._client.post(path, data, {
            params
        })
    }

    async Delete (path, params) {
        let p = Object.assign(this._parameters, params)
        return this._client.delete(path, p)
    }

    async Put (path, data) {
        return this._client.put(path, data)
    }

    SetDefaultHeader (name, value, method) {
        if (method) {
            this._headers[method.toLowerCase()] = this._headers[method.toLowerCase()] || {}
            this._headers[method.toLowerCase()][name] = value
        } else {
            this._headers[name] = value
        }
        this._client.defaults.headers = this._headers
    }

    SetDefaultParameter (name, value) {
        this._parameters[name] = value
        this._client.defaults.params = this._parameters
    }

    RemoveDefaultParameter (name) {
        delete this._parameters[name]
        this._client.defaults.params = this._parameters
    }

    RemoveDefaultHeader (name, method) {
        if (method) {
            if (this._headers[method.toLowerCase()]) {
                delete this._headers[method.toLowerCase()][name]
            }
        } else {
            delete this._headers[name]
        }
        this._client.defaults.headers = this._headers
    }

    set BaseUrl (value) {
        this._baseUrl = new url.URL(value)
    }
    get BaseUrl () {
        return this._baseUrl.href
    }
}
