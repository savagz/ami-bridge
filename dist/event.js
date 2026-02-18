import Message from './message.js';
export default class AmiEvent extends Message {
    static from(data) {
        return Message.parse(data);
    }
    constructor(data) {
        super();
        this.parse(data);
    }
}
//# sourceMappingURL=event.js.map