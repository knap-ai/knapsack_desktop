export declare const theme: {
    readonly accent: import("node_modules/chalk/source/index.js").ChalkInstance;
    readonly accentBright: import("node_modules/chalk/source/index.js").ChalkInstance;
    readonly accentDim: import("node_modules/chalk/source/index.js").ChalkInstance;
    readonly info: import("node_modules/chalk/source/index.js").ChalkInstance;
    readonly success: import("node_modules/chalk/source/index.js").ChalkInstance;
    readonly warn: import("node_modules/chalk/source/index.js").ChalkInstance;
    readonly error: import("node_modules/chalk/source/index.js").ChalkInstance;
    readonly muted: import("node_modules/chalk/source/index.js").ChalkInstance;
    readonly heading: import("node_modules/chalk/source/index.js").ChalkInstance;
    readonly command: import("node_modules/chalk/source/index.js").ChalkInstance;
    readonly option: import("node_modules/chalk/source/index.js").ChalkInstance;
};
export declare const isRich: () => boolean;
export declare const colorize: (rich: boolean, color: (value: string) => string, value: string) => string;
