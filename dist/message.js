"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_js_1 = require("./constants.js");
const FIELDS_TO_SKIP_WHILE_FORMAT = ['variables', 'inputData'];
class Message {
    static parse(rawData) {
        const message = new Message();
        message.parse(rawData);
        return message;
    }
    variables;
    incomingData;
    constructor() {
        this.variables = {};
    }
    format() {
        return `${this.formatFields()}${this.formatVariables()}${constants_js_1.EOL}`;
    }
    formatFields() {
        return Object.keys(this)
            .filter((key) => !FIELDS_TO_SKIP_WHILE_FORMAT.includes(key))
            .filter((key) => typeof this[key] !== 'function' &&
            typeof this[key] !== 'undefined')
            .reduce((accumulator, key) => `${accumulator}${key}: ${this[key]}${constants_js_1.EOL}`, '');
    }
    formatVariables() {
        return Object.keys(this.variables).reduce((accumulator, key) => `${accumulator}Variable: ${key}=${this.variables[key]}${constants_js_1.EOL}`, '');
    }
    parse(rawData) {
        const data = rawData.split(constants_js_1.EOL);
        let lastVariable = '';
        for (let i = 0; i < data.length; i++) {
            const line = data[i] ?? '';
            const value = line.split(':');
            const first = value.shift() || '';
            const keyName = first.toLowerCase().replace(/-/g, '_');
            const keyValue = value.join(':').replace(/(^\s+)|(\s+$)/g, '');
            if (keyName === 'variable') {
                lastVariable = keyValue;
            }
            else if (keyName === 'value') {
                this.variables[lastVariable] = keyValue;
                lastVariable = '';
            }
            else if (/^chanvariable/.test(keyName)) {
                this[keyName] = this[keyName] || {};
                const subVal = keyValue.split('=');
                const subKey = subVal.shift().toLowerCase();
                this[keyName][subKey] = subVal.join('=');
                continue;
            }
            this.set(keyName, keyValue);
        }
        this.incomingData = data;
    }
    set(name, value) {
        if (name === 'variables') {
            throw new Error('Can\'t set field with name = "variables". Use Message#setVariable(name, value).');
        }
        this[name] = value;
    }
    setVariable(name, value) {
        this.variables[name] = value;
    }
}
exports.default = Message;
//# sourceMappingURL=message.js.map