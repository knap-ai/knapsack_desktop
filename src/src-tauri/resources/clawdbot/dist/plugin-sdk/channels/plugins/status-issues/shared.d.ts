import { isRecord } from "../../../utils.js";
export { isRecord };
export declare function asString(value: unknown): string | undefined;
export declare function formatMatchMetadata(params: {
    matchKey?: unknown;
    matchSource?: unknown;
}): string | undefined;
export declare function appendMatchMetadata(message: string, params: {
    matchKey?: unknown;
    matchSource?: unknown;
}): string;
