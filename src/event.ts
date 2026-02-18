import Message from './message.js';

export default class AmiEvent extends Message {
  static from(data: any) {
    return Message.parse(data);
  }
  constructor(data: any) {
    super();
    this.parse(data);
  }
}
