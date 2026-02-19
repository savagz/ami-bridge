declare const _default: ({
    name: string;
    params: string[];
    optional?: never;
    defaults?: never;
} | {
    name: string;
    params: string[];
    optional: string[];
    defaults?: never;
} | {
    name: string;
    params: string[];
    defaults: {
        LoadType: string;
        format?: never;
        mix?: never;
        Paused?: never;
    };
    optional?: never;
} | {
    name: string;
    params: string[];
    defaults: {
        format: string;
        mix: boolean;
        LoadType?: never;
        Paused?: never;
    };
    optional?: never;
} | {
    name: string;
    params: string[];
    optional: string[];
    defaults: {
        Paused: boolean;
        LoadType?: never;
        format?: never;
        mix?: never;
    };
} | {
    name: string;
    params?: never;
    optional?: never;
    defaults?: never;
})[];
export default _default;
//# sourceMappingURL=action-specifications.d.ts.map