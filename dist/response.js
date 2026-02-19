"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const message_js_1 = require("./message.js");
const queue_message_js_1 = require("./response-formats/queue-message.js");
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
class Response extends message_js_1.default {
    static tryFormat(message, callback) {
        if (isQueueMessage(message)) {
            return (0, queue_message_js_1.default)(message, callback);
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
exports.default = Response;
//# sourceMappingURL=response.js.map