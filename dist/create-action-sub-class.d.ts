export default function createActionSubClass({ name, params: paramNames, optional, defaults, }: any, ParentClass: any): {
    new (...args: any[]): {
        [x: string]: any;
    };
    [x: string]: any;
    from(...params: any[]): {
        [x: string]: any;
    };
};
//# sourceMappingURL=create-action-sub-class.d.ts.map