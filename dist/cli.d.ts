type AmiConfig = {
    host?: string | undefined;
    port?: number | undefined;
    login?: string | undefined;
    password?: string | undefined;
    encoding?: string | undefined;
};
export declare function parseArgs(argv: string[], env: NodeJS.ProcessEnv): {
    config: AmiConfig;
    file?: string | undefined;
};
export declare function runCli(): void;
export {};
//# sourceMappingURL=cli.d.ts.map