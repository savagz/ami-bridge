import { EOL } from './constants.js';

const FIELDS_TO_SKIP_WHILE_FORMAT = ['variables', 'inputData'];

export default class Message {
  static parse(rawData: string) {
    const message = new Message();
    message.parse(rawData);
    return message;
  }

  variables: Record<string, any>;
  incomingData: string[] | undefined;

  constructor() {
    this.variables = {};
  }

  format() {
    return `${this.formatFields()}${this.formatVariables()}${EOL}`;
  }

  formatFields() {
    return Object.keys(this)
      .filter((key) => !FIELDS_TO_SKIP_WHILE_FORMAT.includes(key))
      .filter(
        (key) =>
          typeof (this as any)[key] !== 'function' &&
          typeof (this as any)[key] !== 'undefined'
      )
      .reduce(
        (accumulator, key) => `${accumulator}${key}: ${(this as any)[key]}${EOL}`,
        ''
      );
  }

  formatVariables() {
    return Object.keys(this.variables).reduce(
      (accumulator, key) =>
        `${accumulator}Variable: ${key}=${this.variables[key]}${EOL}`,
      ''
    );
  }

  parse(rawData: string) {
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
      } else if (keyName === 'value') {
        this.variables[lastVariable] = keyValue;
        lastVariable = '';
      } else if (/^chanvariable/.test(keyName)) {
        (this as any)[keyName] = (this as any)[keyName] || {};
        const subVal = keyValue.split('=');
        const subKey = subVal.shift()!.toLowerCase();
        (this as any)[keyName][subKey] = subVal.join('=');
        continue;
      }
      this.set(keyName, keyValue);
    }
    this.incomingData = data;
  }

  set(name: string, value: any) {
    if (name === 'variables') {
      throw new Error(
        'Can\'t set field with name = "variables". Use Message#setVariable(name, value).'
      );
    }
    (this as any)[name] = value;
  }

  setVariable(name: string, value: any) {
    this.variables[name] = value;
  }
}
