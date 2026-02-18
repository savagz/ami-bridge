import { EOL } from './constants.js';
const FIELDS_TO_SKIP_WHILE_FORMAT = ['variables', 'inputData'];
export default class Message {
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
        return `${this.formatFields()}${this.formatVariables()}${EOL}`;
    }
    formatFields() {
        return Object.keys(this)
            .filter((key) => !FIELDS_TO_SKIP_WHILE_FORMAT.includes(key))
            .filter((key) => typeof this[key] !== 'function' &&
            typeof this[key] !== 'undefined')
            .reduce((accumulator, key) => `${accumulator}${key}: ${this[key]}${EOL}`, '');
    }
    formatVariables() {
        return Object.keys(this.variables).reduce((accumulator, key) => `${accumulator}Variable: ${key}=${this.variables[key]}${EOL}`, '');
    }
    parse(rawData) {
        const data = rawData.split(EOL);
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
//# sourceMappingURL=message.js.map