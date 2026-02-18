import Message from './message.js';
import formatQueueMessage from './response-formats/queue-message.js';
const QUEUE_REGEXP = /.* has .* call[s]? .* in .*/i;
function isQueueMessage(message) {
    const rawStr = typeof message.raw === 'string' ? message.raw : '';
    if (rawStr) {
        const first = rawStr.split('\r\n')[0];
        if (QUEUE_REGEXP.test(first) || /has .* in .*/i.test(first))
            return true;
    }
    const incoming = message.incomingData;
    const firstLine = Array.isArray(incoming) ? incoming[0] : '';
    return QUEUE_REGEXP.test(firstLine) || /has .* in .*/i.test(firstLine);
}
export default class Response extends Message {
    static tryFormat(message, callback) {
        if (isQueueMessage(message)) {
            return formatQueueMessage(message, callback);
        }
        return callback(new Error('Undefined format'));
    }
    events;
    constructor(rawData) {
        super();
        this.parse(rawData);
        this.events = [];
    }
}
//# sourceMappingURL=response.js.map