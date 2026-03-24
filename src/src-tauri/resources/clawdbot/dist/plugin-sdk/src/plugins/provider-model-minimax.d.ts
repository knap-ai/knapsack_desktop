export declare const MINIMAX_DEFAULT_MODEL_ID = "MiniMax-M2.7";
export declare const MINIMAX_DEFAULT_MODEL_REF = "minimax/MiniMax-M2.7";
export declare const MINIMAX_TEXT_MODEL_ORDER: readonly ["MiniMax-M2", "MiniMax-M2.1", "MiniMax-M2.1-highspeed", "MiniMax-M2.7", "MiniMax-M2.7-highspeed", "MiniMax-M2.5", "MiniMax-M2.5-highspeed"];
export declare const MINIMAX_TEXT_MODEL_CATALOG: {
    readonly "MiniMax-M2": {
        readonly name: "MiniMax M2";
        readonly reasoning: true;
    };
    readonly "MiniMax-M2.1": {
        readonly name: "MiniMax M2.1";
        readonly reasoning: true;
    };
    readonly "MiniMax-M2.1-highspeed": {
        readonly name: "MiniMax M2.1 Highspeed";
        readonly reasoning: true;
    };
    readonly "MiniMax-M2.7": {
        readonly name: "MiniMax M2.7";
        readonly reasoning: true;
    };
    readonly "MiniMax-M2.7-highspeed": {
        readonly name: "MiniMax M2.7 Highspeed";
        readonly reasoning: true;
    };
    readonly "MiniMax-M2.5": {
        readonly name: "MiniMax M2.5";
        readonly reasoning: true;
    };
    readonly "MiniMax-M2.5-highspeed": {
        readonly name: "MiniMax M2.5 Highspeed";
        readonly reasoning: true;
    };
};
export declare const MINIMAX_TEXT_MODEL_REFS: string[];
export declare const MINIMAX_MODERN_MODEL_MATCHERS: readonly ["minimax-m2", "minimax-m2.1", "minimax-m2.5", "minimax-m2.7"];
export declare function isMiniMaxModernModelId(modelId: string): boolean;
