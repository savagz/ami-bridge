import specs from './action-specifications.js';
import createActionSubClass from './create-action-sub-class.js';
import getId from './get-id.js';
import Message from './message.js';
export class ActionBase extends Message {
    static from(params = {}) {
        return Object.assign(new ActionBase(params.Action), params);
    }
    id;
    constructor(name) {
        super();
        this.id = getId();
        this.set('ActionID', this.id);
        this.set('Action', name);
    }
}
const Actions = {};
for (const spec of specs) {
    Actions[spec.name] = createActionSubClass(spec, ActionBase);
}
export function createAction(spec) {
    return createActionSubClass(spec, ActionBase);
}
export default Actions;
//# sourceMappingURL=action.js.map