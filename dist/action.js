"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionBase = void 0;
exports.createAction = createAction;
const action_specifications_js_1 = require("./action-specifications.js");
const create_action_sub_class_js_1 = require("./create-action-sub-class.js");
const get_id_js_1 = require("./get-id.js");
const message_js_1 = require("./message.js");
class ActionBase extends message_js_1.default {
    static from(params = {}) {
        return Object.assign(new ActionBase(params.Action), params);
    }
    id;
    constructor(name) {
        super();
        this.id = (0, get_id_js_1.default)();
        this.set('ActionID', this.id);
        this.set('Action', name);
    }
}
exports.ActionBase = ActionBase;
const Actions = {};
for (const spec of action_specifications_js_1.default) {
    Actions[spec.name] = (0, create_action_sub_class_js_1.default)(spec, ActionBase);
}
function createAction(spec) {
    return (0, create_action_sub_class_js_1.default)(spec, ActionBase);
}
exports.default = Actions;
//# sourceMappingURL=action.js.map