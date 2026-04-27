import type { PluginRuntime } from "../plugins/runtime/types.js";
export type MatrixResolvedStringField = "homeserver" | "userId" | "accessToken" | "password" | "deviceId" | "deviceName";
export type MatrixResolvedStringValues = Record<MatrixResolvedStringField, string>;
type MatrixStringSourceMap = Partial<Record<MatrixResolvedStringField, string>>;
type FacadeModule = {
    resolveMatrixAccountStringValues: (params: {
        accountId: string;
        account?: MatrixStringSourceMap;
        scopedEnv?: MatrixStringSourceMap;
        channel?: MatrixStringSourceMap;
        globalEnv?: MatrixStringSourceMap;
    }) => MatrixResolvedStringValues;
    setMatrixRuntime: (runtime: PluginRuntime) => void;
};
export declare const resolveMatrixAccountStringValues: FacadeModule["resolveMatrixAccountStringValues"];
export declare const setMatrixRuntime: FacadeModule["setMatrixRuntime"];
export {};
