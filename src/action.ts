import specs from './action-specifications.js';
import createActionSubClass from './create-action-sub-class.js';
import getId from './get-id.js';
import Message from './message.js';

export class ActionBase extends Message {
  static from(params: Record<string, any> = {}) {
    return Object.assign(new ActionBase((params as any).Action), params);
  }
  id: number;
  constructor(name: string) {
    super();
    this.id = getId();
    this.set('ActionID', this.id);
    this.set('Action', name);
  }
}

const Actions: Record<string, any> = {};
for (const spec of specs as any[]) {
  Actions[spec.name] = createActionSubClass(spec, ActionBase);
}
export function createAction(spec: any) {
  return createActionSubClass(spec, ActionBase);
}
export default Actions;
