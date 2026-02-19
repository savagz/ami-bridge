"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const message_js_1 = require("./message.js");
class AmiEvent extends message_js_1.default {
    static from(data) {
        return message_js_1.default.parse(data);
    }
    constructor(data) {
        super();
        this.parse(data);
    }
}
exports.default = AmiEvent;
//# sourceMappingURL=event.js.map