import Message from './message.js';
export declare class ActionBase extends Message {
    static from(params?: Record<string, any>): ActionBase & Record<string, any>;
    id: number;
    constructor(name: string);
}
declare const Actions: Record<string, any>;
export declare function createAction(spec: any): {
    new (...args: any[]): {
        [x: string]: any;
    };
    [x: string]: any;
    from(...params: any[]): {
        [x: string]: any;
    };
};
export default Actions;
//# sourceMappingURL=action.d.ts.map